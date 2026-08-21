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
            results["layer_scores"]["metadata"] = self._score(l1_res)
            results["details"]["metadata"] = l1_res
            results["is_verified"] = bool(l1_res["details"].get("provenance_verified", False))
            results["c2pa_data"] = l1_res["details"].get("c2pa", {})

            # Layer 2: Biological signal analysis.
            l2_res = self.layer2.analyze_video(file_path) if is_video else self.layer2.analyze_image(file_path)
            results["layer_scores"]["biology_rppg"] = self._score(l2_res)
            results["details"]["biology"] = l2_res

            # Layers 3-6 operate on an image. Videos use the first decoded frame.
            if image_path and os.path.exists(image_path):
                l3_res = self.layer3.analyze(image_path)
                l4_score = float(self.layer4.analyze(image_path))
                l5_res = self.layer5.analyze(image_path)
                l6_res = self.layer6.analyze(image_path)
            else:
                l3_res = self._empty_layer("Could not decode a video frame")
                l4_score = 0.5
                l5_res = self._empty_layer("Could not decode a video frame")
                l6_res = self._empty_layer("Could not decode a video frame")

            results["layer_scores"]["math_forensics"] = self._score(l3_res)
            results["details"]["math"] = l3_res

            results["layer_scores"]["ai_model"] = float(l4_score)
            results["details"]["ai_model"] = self.layer4.get_last_details()

            results["layer_scores"]["physics"] = self._score(l5_res)
            results["details"]["physics"] = l5_res

            results["layer_scores"]["early_signature"] = self._score(l6_res)
            results["details"]["early_signature"] = l6_res

            # Layer 7: ELA is meaningful for still images only.
            if not is_video:
                output_dir = os.path.dirname(file_path)
                l7_res = self.layer7.analyze(file_path, output_dir)
                results["layer_scores"]["ela"] = self._score(l7_res)
                results["details"]["ela"] = {
                    "score": l7_res["score"],
                    "details": l7_res["details"],
                    "anomalies": l7_res.get("anomalies", []),
                }
                results["ela_url"] = l7_res["ela_image_path"]

            final_score, dominant_signals = self._aggregate(results["layer_scores"])

            if results["is_verified"]:
                final_score = min(final_score, 0.2)

            results["confidence"] = round(float(final_score), 3)
            results["verdict"] = self._verdict(final_score)
            results["explanation"] = self._explain(results, dominant_signals)
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
            if key in layer_scores:
                total_score += float(layer_scores[key]) * weight
                total_weight += weight

        final_score = total_score / total_weight if total_weight else 0.0

        dominant_signals = []
        for layer in ["early_signature", "ai_model", "math_forensics"]:
            score = float(layer_scores.get(layer, 0.0))
            if score > 0.85:
                final_score = max(final_score, score)
                dominant_signals.append(layer)

        return final_score, dominant_signals

    def _explain(self, results: Dict[str, Any], dominant_signals):
        anomalies = []
        for layer_result in results["details"].values():
            if isinstance(layer_result, dict):
                anomalies.extend(layer_result.get("anomalies", []))

        if results["is_verified"]:
            return "Valid C2PA provenance was found, so the content is treated as verified unless other evidence is reviewed manually."

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

    def _score(self, layer_result: Dict[str, Any]) -> float:
        return float(layer_result.get("score", 0.0))

    def _empty_layer(self, reason: str) -> Dict[str, Any]:
        return {"score": 0.0, "details": {"reason": reason}, "anomalies": [reason]}
