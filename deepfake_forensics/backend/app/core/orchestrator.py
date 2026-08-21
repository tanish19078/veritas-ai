import os
from typing import Any, Dict, Optional

import cv2

from app.layers.layer1_metadata import MetadataAnalyzer
from app.layers.layer2_biology import BiologicalAnalyzer
from app.layers.layer3_math import MathAnalyzer
from app.layers.layer4_hybrid_model import AIModelAnalyzer
from app.layers.layer5_physics import PhysicsAnalyzer
from app.layers.layer6_early_signature import EarlySignatureAnalyzer
from app.layers.layer7_ela import ELAAnalyzer


VIDEO_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}

# Minimum fraction of pipeline weight that must produce a signal before a
# verdict other than "Inconclusive" is allowed.
MIN_ACTIVE_WEIGHT = 0.4


class ForensicsOrchestrator:
    def __init__(self):
        self.layer1 = MetadataAnalyzer()
        self.layer2 = BiologicalAnalyzer()
        self.layer3 = MathAnalyzer()
        self.layer4 = AIModelAnalyzer()
        self.layer5 = PhysicsAnalyzer()
        self.layer6 = EarlySignatureAnalyzer()
        self.layer7 = ELAAnalyzer()

    def analyze_media(self, file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            return {"error": "File not found"}

        ext = os.path.splitext(file_path)[1].lower()
        is_video = ext in VIDEO_EXTENSIONS
        frame_path: Optional[str] = None

        results = {
            "verdict": "Inconclusive",
            "confidence": 0.0,
            "layer_scores": {},
            "explanation": "",
            "details": {},
            "ela_url": None,
            "is_verified": False,
            "c2pa_data": {},
        }

        try:
            frame_path = self._extract_first_frame(file_path) if is_video else None
            image_path = frame_path or file_path

            # Layer 1: Metadata and provenance.
            l1_res = self.layer1.analyze(file_path)
            results["details"]["metadata"] = l1_res
            results["is_verified"] = bool(l1_res["details"].get("provenance_verified", False))
            results["c2pa_data"] = l1_res["details"].get("c2pa", {})

            # Layer 2: Biological signal analysis.
            l2_res = self.layer2.analyze_video(file_path) if is_video else self.layer2.analyze_image(file_path)
            results["details"]["biology"] = l2_res

            # Layers 3-6 operate on an image. Videos use the first decoded frame.
            if image_path and os.path.exists(image_path):
                l3_res = self.layer3.analyze(image_path)
                l4_score = float(self.layer4.analyze(image_path))
                l5_res = self.layer5.analyze(image_path)
                l6_res = self.layer6.analyze(image_path)
            else:
                l3_res = self._empty_layer("Could not decode a video frame")
                l4_score = None
                l5_res = self._empty_layer("Could not decode a video frame")
                l6_res = self._empty_layer("Could not decode a video frame")

            results["details"]["math"] = l3_res
            results["details"]["ai_model"] = self.layer4.get_last_details()
            results["details"]["physics"] = l5_res
            results["details"]["early_signature"] = l6_res

            # Layer 7: ELA is meaningful for still images only.
            l7_res = None
            if not is_video:
                output_dir = os.path.dirname(file_path)
                l7_res = self.layer7.analyze(file_path, output_dir)
                results["details"]["ela"] = {
                    "score": l7_res.get("score"),
                    "details": l7_res["details"],
                    "anomalies": l7_res.get("anomalies", []),
                }
                results["ela_url"] = l7_res["ela_image_path"]

            # A layer that cannot judge the media returns no score at all.
            # Those layers are excluded from aggregation instead of voting 0.0
            # ("Real"), which previously diluted every image verdict.
            layer_scores = {
                "metadata": self._score(l1_res),
                "biology_rppg": self._score(l2_res),
                "math_forensics": self._score(l3_res),
                "ai_model": l4_score,
                "physics": self._score(l5_res),
                "early_signature": self._score(l6_res),
                "ela": self._score(l7_res) if l7_res is not None else None,
            }
            results["layer_scores"] = {
                key: round(float(value), 3)
                for key, value in layer_scores.items()
                if value is not None
            }

            final_score, dominant_signals, sufficient_evidence = self._aggregate(results["layer_scores"])

            if results["is_verified"]:
                final_score = min(final_score, 0.2)

            results["confidence"] = round(float(final_score), 3)
            results["verdict"] = self._verdict(final_score) if sufficient_evidence else "Inconclusive"
            results["explanation"] = self._explain(results, dominant_signals, sufficient_evidence)
            return results

        finally:
            if frame_path and os.path.exists(frame_path):
                os.remove(frame_path)

    def _extract_first_frame(self, file_path: str) -> Optional[str]:
        cap = cv2.VideoCapture(file_path)
        try:
            ret, frame = cap.read()
            if not ret:
                return None

            frame_path = f"{file_path}_frame0.jpg"
            cv2.imwrite(frame_path, frame)
            return frame_path
        finally:
            cap.release()

    def _aggregate(self, layer_scores: Dict[str, float]):
        weights = {
            "metadata": 0.10,
            "biology_rppg": 0.10,
            "math_forensics": 0.25,
            "ai_model": 0.25,
            "physics": 0.05,
            "early_signature": 0.20,
            "ela": 0.05,
        }

        total_score = 0.0
        total_weight = 0.0
        for key, weight in weights.items():
            score = layer_scores.get(key)
            if score is None:
                continue
            total_score += float(score) * weight
            total_weight += weight

        final_score = total_score / total_weight if total_weight else 0.0

        dominant_signals = []
        for layer in ["early_signature", "ai_model", "math_forensics"]:
            score = layer_scores.get(layer)
            if score is not None and float(score) > 0.85:
                final_score = max(final_score, float(score))
                dominant_signals.append(layer)

        sufficient_evidence = total_weight >= MIN_ACTIVE_WEIGHT
        return final_score, dominant_signals, sufficient_evidence

    def _explain(self, results: Dict[str, Any], dominant_signals, sufficient_evidence: bool = True):
        if results["is_verified"]:
            return "Valid C2PA provenance was found, so the content is treated as verified unless other evidence is reviewed manually."

        if not sufficient_evidence:
            return "Not enough forensic layers produced a signal on this media; the result is inconclusive and manual review is recommended."

        anomalies = []
        for layer_result in results["details"].values():
            if isinstance(layer_result, dict):
                anomalies.extend(layer_result.get("anomalies", []))

        if anomalies:
            explanation = f"Flagged as {results['verdict']} due to: " + "; ".join(anomalies)
        elif results["confidence"] < 0.3:
            explanation = "No significant artifacts found. Content appears authentic based on the available checks."
        else:
            explanation = "No specific anomaly dominated, but combined forensic signals suggest manual review."

        if dominant_signals:
            explanation += " Strong signal detected in: " + ", ".join(dominant_signals) + "."

        return explanation

    def _verdict(self, final_score: float) -> str:
        if final_score > 0.75:
            return "AI-Generated"
        if final_score > 0.4:
            return "Suspicious / Inconclusive"
        return "Real"

    def _score(self, layer_result: Optional[Dict[str, Any]]) -> Optional[float]:
        if not layer_result:
            return None
        score = layer_result.get("score")
        if score is None:
            return None
        try:
            return float(score)
        except (TypeError, ValueError):
            return None

    def _empty_layer(self, reason: str) -> Dict[str, Any]:
        # No score: an undecodable layer must not vote 0.0 ("Real").
        return {"score": None, "details": {"reason": reason}, "anomalies": []}
