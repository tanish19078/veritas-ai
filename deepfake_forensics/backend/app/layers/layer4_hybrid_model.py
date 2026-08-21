import cv2
import numpy as np


class AIModelAnalyzer:
    """
    Layer 4: lightweight AI-artifact heuristic.

    This project does not ship a trained deepfake model. The analyzer therefore
    uses deterministic image statistics that are safe to run locally and in
    Docker without downloading pretrained weights.
    """

    def __init__(self):
        self.last_details = {}

    def analyze_from_path(self, image_path: str) -> float:
        img = cv2.imread(image_path)
        if img is None:
            self.last_details = {"error": "Image could not be decoded"}
            return 0.5

        return self._score_image(img)

    def analyze(self, image_input) -> float:
        if isinstance(image_input, str):
            return self.analyze_from_path(image_input)

        if isinstance(image_input, np.ndarray):
            return self._score_image(image_input)

        self.last_details = {"error": "Unsupported input type"}
        return 0.5

    def get_last_details(self):
        return self.last_details

    def _score_image(self, img: np.ndarray) -> float:
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
