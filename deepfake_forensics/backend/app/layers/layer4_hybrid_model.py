import logging
import os
from typing import Any, Dict, Optional

import cv2
import numpy as np

logger = logging.getLogger(__name__)

# Labels commonly used by AI-image detectors on the Hugging Face hub.
AI_LABEL_KEYWORDS = ("artificial", "ai", "fake", "synthetic", "generated")


class AIModelAnalyzer:
    """
    Layer 4: AI-artifact detector.

    Modes (env LAYER4_MODE):
      - "pretrained": Hugging Face image-classification detector only.
      - "heuristic":  deterministic blur/entropy/color statistics only.
      - "auto":       pretrained when the optional dependencies and model
                      weights are available; otherwise heuristic.

    The pretrained path is intentionally lazy: nothing is downloaded unless
    transformers/torch are installed and LAYER4_MODE allows it. This keeps
    the Docker image lightweight (heuristic-only) while enabling the stronger
    detector in local venv setups.
    """

    def __init__(self):
        self.last_details: Dict[str, Any] = {}
        self.mode = os.getenv("LAYER4_MODE", "auto").strip().lower()
        self.model_name = os.getenv("LAYER4_MODEL_NAME", "umm-maybe/AI-image-detector")
        self._pipeline = None
        self._pretrained_state = "unloaded"  # unloaded | loaded | failed

    # ------------------------------------------------------------------ #
    # Public API
    # ------------------------------------------------------------------ #
    def analyze_from_path(self, image_path: str) -> Optional[float]:
        img = cv2.imread(image_path)
        if img is None:
            self.last_details = {"error": "Image could not be decoded"}
            return None

        return self._score_image(img)

    def analyze(self, image_input) -> Optional[float]:
        if isinstance(image_input, str):
            return self.analyze_from_path(image_input)

        if isinstance(image_input, np.ndarray):
            return self._score_image(image_input)

        self.last_details = {"error": "Unsupported input type"}
        return None

    def get_last_details(self):
        return self.last_details

    # ------------------------------------------------------------------ #
    # Pretrained detector
    # ------------------------------------------------------------------ #
    def _load_pretrained(self):
        if self._pretrained_state == "loaded":
            return self._pipeline
        if self._pretrained_state == "failed":
            return None

        try:
            from transformers import pipeline as hf_pipeline

            logger.info("Layer 4 loading pretrained model '%s'", self.model_name)
            self._pipeline = hf_pipeline("image-classification", model=self.model_name)
            self._pretrained_state = "loaded"
        except Exception as exc:
            logger.warning("Layer 4 pretrained model unavailable (%s); using heuristic mode", exc)
            self._pretrained_state = "failed"
            self._pipeline = None
        return self._pipeline

    def _pretrained_score(self, img: np.ndarray) -> Optional[float]:
        pipe = self._load_pretrained()
        if pipe is None:
            return None

        try:
            from PIL import Image

            pil_image = Image.fromarray(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
            predictions = pipe(pil_image, top_k=None)

            ai_score = 0.0
            labels_seen = {}
            for prediction in predictions:
                label = str(prediction["label"]).lower()
                labels_seen[prediction["label"]] = round(float(prediction["score"]), 4)
                if any(keyword in label for keyword in AI_LABEL_KEYWORDS):
                    ai_score = max(ai_score, float(prediction["score"]))

            self.last_details = {
                "method": "pretrained",
                "model_name": self.model_name,
                "labels": labels_seen,
                "ai_score": round(ai_score, 4),
            }
            return max(0.0, min(ai_score, 1.0))
        except Exception as exc:
            logger.warning("Layer 4 pretrained inference failed (%s); falling back", exc)
            self._pretrained_state = "failed"
            self._pipeline = None
            return None

    # ------------------------------------------------------------------ #
    # Heuristic fallback
    # ------------------------------------------------------------------ #
    def _heuristic_score(self, img: np.ndarray) -> float:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())

        hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
        hist = hist / (hist.sum() + 1e-7)
        entropy = float(-np.sum(hist * np.log2(hist + 1e-7)))

        # Low sharpness and low entropy can indicate oversmoothing, a common
        # artifact in low-quality generated or heavily processed images.
        blur_score = 1.0 - min(laplacian_var / 500.0, 1.0)
        entropy_score = 1.0 - min(entropy / 8.0, 1.0)

        b, g, r = cv2.split(img.astype(np.float32))
        channel_spread = float(np.std([np.mean(b), np.mean(g), np.mean(r)]) / 255.0)
        color_flatness_score = 1.0 - min(channel_spread / 0.12, 1.0)

        final_score = (blur_score * 0.45) + (entropy_score * 0.35) + (color_flatness_score * 0.20)
        final_score = max(0.0, min(float(final_score), 1.0))

        self.last_details = {
            "method": "blur_entropy_color_heuristic",
            "laplacian_variance": laplacian_var,
            "entropy": entropy,
            "channel_spread": channel_spread,
            "blur_score": float(blur_score),
            "entropy_score": float(entropy_score),
            "color_flatness_score": float(color_flatness_score),
        }
        return final_score

    def _score_image(self, img: np.ndarray) -> float:
        if self.mode in ("auto", "pretrained"):
            score = self._pretrained_score(img)
            if score is not None:
                if self.mode == "auto":
                    # Keep heuristic statistics alongside for transparency.
                    pretrained_details = dict(self.last_details)
                    self._heuristic_score(img)
                    heuristic_stats = {
                        key: value
                        for key, value in self.last_details.items()
                        if key != "method"
                    }
                    self.last_details = {
                        **pretrained_details,
                        "mode": "auto",
                        "heuristic_stats": heuristic_stats,
                    }
                else:
                    self.last_details["mode"] = "pretrained"
                return score

        return self._heuristic_score(img)
