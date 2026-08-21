import cv2
import numpy as np
from typing import Dict, Any

class MathAnalyzer:
    """
    Layer 3: Mathematical Forensics Layer
    - 3A. FFT (Fast Fourier Transform)
    - 3B. DCT (Discrete Cosine Transform)
    - 3C. CFA / Bayer Pattern Detection
    - 3D. Noise Residual Extraction (BayarConv stub)
    """

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
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Accumulate evidence separately so an abstaining layer stays None.
        score = 0.0

        # 3A. FFT Analysis
        fft_score = float(self._analyze_fft(gray))
        results["details"]["fft_score"] = fft_score
        if fft_score > 0.7:
            results["anomalies"].append("Strong periodic artifacts in FFT (Grid patterns)")
            score += 0.4

        # 3B. DCT Analysis
        dct_score = float(self._analyze_dct(gray))
        results["details"]["dct_score"] = dct_score
        if dct_score > 0.6:
             results["anomalies"].append("Abnormal DCT coefficient distribution")
             score += 0.3

        # 3C. CFA Analysis (Bayer Pattern)
        # AI images usually lack a Bayer pattern trace because they are generated directly as RGB
        cfa_score = float(self._analyze_cfa(img))
        results["details"]["cfa_absence_score"] = cfa_score
        if cfa_score > 0.8:
            results["anomalies"].append("Missing CFA/Bayer pattern traces (Direct RGB generation)")
            score += 0.5

        # Normalize total score
        results["score"] = min(score, 0.99)
        
        return results

    def _analyze_fft(self, gray_img: np.ndarray) -> float:
        """
        Detects checkerboard artifacts and grid patterns using FFT.
        """
        f = np.fft.fft2(gray_img)
        fshift = np.fft.fftshift(f)
        magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-8)
        
        # Calculate average magnitude in high frequency regions
        h, w = magnitude_spectrum.shape
        center_h, center_w = h // 2, w // 2
        
        # Mask out the center (low frequencies)
        mask_radius = 20
        y, x = np.ogrid[:h, :w]
        mask = (x - center_w)**2 + (y - center_h)**2 > mask_radius**2
        
        high_freq_energy = np.mean(magnitude_spectrum[mask])
        
        # Simple heuristic: AI images often have unusually high energy spikes in high freq
        # A more robust method checks for specific peaks (stars)
        # For this implementation, we return a normalized score based on a threshold
        # This threshold is arbitrary for this demo
        score = min(high_freq_energy / 100.0, 1.0) 
        return score

    def _analyze_dct(self, gray_img: np.ndarray) -> float:
        """
        Analyzes DCT coefficients for double quantization or abnormal distributions.
        """
        # Resize to be divisible by 8
        h, w = gray_img.shape
        h = (h // 8) * 8
        w = (w // 8) * 8
        if h == 0 or w == 0:
            return 0.5

        gray_img = gray_img[:h, :w].astype(np.float32)
        
        # JPEG tampering often creates visible 8x8 discontinuities. Compare
        # differences on block boundaries with nearby non-boundary pixels.
        vertical_edges = np.abs(np.diff(gray_img, axis=1))
        horizontal_edges = np.abs(np.diff(gray_img, axis=0))
        boundary_v = vertical_edges[:, 7::8]
        boundary_h = horizontal_edges[7::8, :]
        non_boundary_v = np.delete(vertical_edges, np.arange(7, vertical_edges.shape[1], 8), axis=1)
        non_boundary_h = np.delete(horizontal_edges, np.arange(7, horizontal_edges.shape[0], 8), axis=0)

        boundary_energy = self._mean_or_zero(boundary_v) + self._mean_or_zero(boundary_h)
        natural_energy = self._mean_or_zero(non_boundary_v) + self._mean_or_zero(non_boundary_h) + 1e-6
        block_ratio = boundary_energy / natural_energy
        block_score = self._clamp((block_ratio - 1.15) / 1.75)

        # Sample block DCTs and look for unusually strong high-frequency energy.
        high_freq_scores = []
        hf_mask = np.fromfunction(lambda y, x: (x + y) >= 8, (8, 8), dtype=int)
        for y in range(0, h, 8):
            for x in range(0, w, 8):
                block = gray_img[y:y + 8, x:x + 8] - 128.0
                coeffs = np.abs(cv2.dct(block))
                high = np.mean(coeffs[hf_mask])
                total = np.mean(coeffs) + 1e-6
                high_freq_scores.append(high / total)

        high_freq_ratio = float(np.mean(high_freq_scores)) if high_freq_scores else 0.0
        high_freq_score = self._clamp((high_freq_ratio - 0.45) / 0.55)

        score = (block_score * 0.6) + (high_freq_score * 0.4)
        return float(self._clamp(score))

    def _analyze_cfa(self, img: np.ndarray) -> float:
        """
        Estimates if a Bayer pattern exists.
        Real cameras interpolate RGB from Bayer (GRBG, etc.), leaving correlation traces.
        AI generates RGB directly, so no such correlation exists.
        """
        if img is None or img.size == 0:
            return 0.5

        img = img.astype(np.float32)
        residuals = []
        for channel in cv2.split(img):
            blurred = cv2.GaussianBlur(channel, (5, 5), 0)
            residuals.append((channel - blurred).reshape(-1))

        residual_stds = [float(np.std(res)) for res in residuals]
        residual_energy = float(np.mean(residual_stds) / 255.0)

        correlations = []
        for i in range(len(residuals)):
            for j in range(i + 1, len(residuals)):
                if np.std(residuals[i]) < 1e-6 or np.std(residuals[j]) < 1e-6:
                    correlations.append(0.0)
                else:
                    corr = np.corrcoef(residuals[i], residuals[j])[0, 1]
                    correlations.append(abs(float(corr)))

        mean_corr = float(np.mean(correlations)) if correlations else 0.0

        # Very smooth RGB residuals and highly correlated channel noise can be a
        # weak sign that the image did not come straight from a camera sensor.
        smooth_score = self._clamp((0.012 - residual_energy) / 0.012)
        correlation_score = self._clamp((mean_corr - 0.65) / 0.35)

        return float((smooth_score * 0.65) + (correlation_score * 0.35))

    def _clamp(self, value: float) -> float:
        return max(0.0, min(float(value), 1.0))

    def _mean_or_zero(self, values: np.ndarray) -> float:
        return float(np.mean(values)) if values.size else 0.0
