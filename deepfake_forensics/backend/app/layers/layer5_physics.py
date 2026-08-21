import cv2
import numpy as np
from typing import Any, Dict, Optional, Tuple


class PhysicsAnalyzer:
    """
    Layer 5: Physics & Lighting Consistency Layer
    - Global lighting-gradient consistency (dominant gradient per quadrant)
    - Eye-glint symmetry inside detected faces
    - Abstains (score None) when no usable signal exists
    """

    def __init__(self):
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
        )
        self.eye_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + "haarcascade_eye.xml"
        )

    def analyze(self, image_path: str) -> Dict[str, Any]:
        results = {
            "score": None,
            "details": {},
            "anomalies": []
        }

        img = cv2.imread(image_path)
        if img is None:
            results["details"]["note"] = "Image could not be decoded; layer abstains"
            return results

        lighting = self._analyze_lighting(img)
        results["details"]["lighting"] = lighting

        glint = self._analyze_eye_glints(img)
        results["details"]["eye_glint"] = glint

        sub_scores = [
            entry["score"]
            for entry in (lighting, glint)
            if entry.get("score") is not None
        ]

        if sub_scores:
            final_score = float(np.mean(sub_scores))
            results["score"] = round(final_score, 3)
            if final_score > 0.6:
                results["anomalies"].append(
                    "Inconsistent physics cues (lighting direction / eye reflections)"
                )
        else:
            results["details"]["note"] = (
                "No usable lighting gradient or paired eye glints found; layer abstains"
            )

        return results

    # ------------------------------------------------------------------ #
    # Lighting consistency
    # ------------------------------------------------------------------ #
    def _analyze_lighting(self, img: np.ndarray) -> Dict[str, Any]:
        hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        v_channel = hsv[:, :, 2]

        # Downscale for speed and noise robustness.
        scale = 256.0 / max(v_channel.shape)
        if scale < 1.0:
            v_channel = cv2.resize(
                v_channel,
                (int(v_channel.shape[1] * scale), int(v_channel.shape[0] * scale)),
            )

        variance = self._quadrant_direction_variance(v_channel)

        details: Dict[str, Any] = {
            "direction_variance": round(float(variance), 4),
            "score": None,
        }

        # A flat image carries no lighting information at all -> abstain.
        sobel_x = cv2.Sobel(v_channel, cv2.CV_64F, 1, 0, ksize=5)
        sobel_y = cv2.Sobel(v_channel, cv2.CV_64F, 0, 1, ksize=5)
        mean_magnitude = float(np.mean(np.sqrt(sobel_x ** 2 + sobel_y ** 2)))
        details["mean_gradient_magnitude"] = round(mean_magnitude, 4)

        if mean_magnitude < 1.0:
            return details

        # Circular variance ~0: one coherent light direction.
        # ~1: directions point everywhere, typical of spliced scenes.
        score = float(np.clip((variance - 0.55) / 0.45, 0.0, 1.0))
        details["score"] = round(score, 3)
        return details

    @staticmethod
    def _quadrant_direction_variance(v_channel: np.ndarray) -> float:
        """
        Dominant illumination gradient direction per image quadrant, combined
        into a circular variance in [0, 1] weighted by gradient magnitude.
        """
        h, w = v_channel.shape
        sobel_x = cv2.Sobel(v_channel, cv2.CV_64F, 1, 0, ksize=5)
        sobel_y = cv2.Sobel(v_channel, cv2.CV_64F, 0, 1, ksize=5)

        vectors = []
        for top, bottom in ((0, h // 2), (h // 2, h)):
            for left, right in ((0, w // 2), (w // 2, w)):
                gx = float(np.sum(sobel_x[top:bottom, left:right]))
                gy = float(np.sum(sobel_y[top:bottom, left:right]))
                vectors.append((gx, gy))

        mean_magnitude = sum(np.hypot(gx, gy) for gx, gy in vectors)
        if mean_magnitude < 1e-9:
            return 0.0

        resultant_x = sum(gx for gx, _ in vectors)
        resultant_y = sum(gy for _, gy in vectors)
        resultant = np.hypot(resultant_x, resultant_y)
        return float(1.0 - resultant / mean_magnitude)

    # ------------------------------------------------------------------ #
    # Eye glints
    # ------------------------------------------------------------------ #
    def _analyze_eye_glints(self, img: np.ndarray) -> Dict[str, Any]:
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        if len(faces) == 0:
            return {"checked": False, "reason": "No face detected", "score": None}

        # Largest detected face wins.
        x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
        roi_gray = gray[y:y + h, x:x + w]

        eyes = self.eye_cascade.detectMultiScale(roi_gray, 1.1, 5)
        if len(eyes) < 2:
            return {"checked": False, "reason": "Paired eyes not detected", "score": None}

        # Two largest, ordered left-to-right.
        eyes = sorted(sorted(eyes, key=lambda e: -e[2] * e[3])[:2], key=lambda e: e[0])

        glint_positions = []
        for (ex, ey, ew, eh) in eyes:
            position = self._find_glint(roi_gray[ey:ey + eh, ex:ex + ew])
            if position is None:
                return {"checked": False, "reason": "No visible catchlight", "score": None}
            glint_positions.append(position)

        error = self._glint_position_error(glint_positions[0], glint_positions[1])

        return {
            "checked": True,
            "relative_glints": [
                [round(float(gx), 3), round(float(gy), 3)] for gx, gy in glint_positions
            ],
            "symmetry_error": round(float(error), 4),
            "score": round(float(np.clip(error / 0.35, 0.0, 1.0)), 3),
        }

    @staticmethod
    def _find_glint(eye_roi: np.ndarray) -> Optional[Tuple[float, float]]:
        """
        Brightest pixel inside an eye region, in relative coordinates.
        Catchlights are near-specular highlights, so they are the brightest
        spots; require a reasonably bright maximum to trust it.
        """
        if eye_roi.size == 0:
            return None

        blurred = cv2.GaussianBlur(eye_roi, (3, 3), 0)
        _, max_val, _, max_loc = cv2.minMaxLoc(blurred)
        if max_val < 180:
            return None

        h, w = eye_roi.shape
        return (max_loc[0] / w, max_loc[1] / h)

    @staticmethod
    def _glint_position_error(
        left: Tuple[float, float], right: Tuple[float, float]
    ) -> float:
        """
        Mirrored catchlights should sit at mirror-symmetric positions.
        Returns a combined horizontal + vertical error in [0, ~1].
        """
        horizontal_error = abs(left[0] - (1.0 - right[0]))
        vertical_error = abs(left[1] - right[1])
        return float(min(horizontal_error + vertical_error, 1.0))
