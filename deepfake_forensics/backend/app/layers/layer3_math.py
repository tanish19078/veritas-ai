import cv2
import numpy as np
import scipy.fftpack
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
            "score": 0.0,
            "details": {},
            "anomalies": []
        }
        
        img = cv2.imread(image_path)
        if img is None:
            return results
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # 3A. FFT Analysis
        fft_score = self._analyze_fft(gray)
        results["details"]["fft_score"] = fft_score
        if fft_score > 0.7:
            results["anomalies"].append("Strong periodic artifacts in FFT (Grid patterns)")
            results["score"] += 0.4

        # 3B. DCT Analysis
        dct_score = self._analyze_dct(gray)
        results["details"]["dct_score"] = dct_score
        if dct_score > 0.6:
             results["anomalies"].append("Abnormal DCT coefficient distribution")
             results["score"] += 0.3

        # 3C. CFA Analysis (Bayer Pattern)
        # AI images usually lack a Bayer pattern trace because they are generated directly as RGB
        cfa_score = self._analyze_cfa(img)
        results["details"]["cfa_absence_score"] = cfa_score
        if cfa_score > 0.8:
            results["anomalies"].append("Missing CFA/Bayer pattern traces (Direct RGB generation)")
            results["score"] += 0.5

        # Normalize total score
        results["score"] = min(results["score"], 0.99)
        
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
        gray_img = gray_img[:h, :w]
        
        # Compute block-wise DCT
        # This is a simplified global DCT check
        dct = cv2.dct(np.float32(gray_img)/255.0)
        
        # Check histogram of coefficients
        # AI images might have different kurtosis in DCT space
        # Here we use a placeholder logic: check for sparsity
        # Real images are sparse in DCT, AI might be less so or have specific artifacts
        
        abs_dct = np.abs(dct)
        mean_energy = np.mean(abs_dct)
        
        # Very rough heuristic
        score = 0.5 # Neutral by default
        return score

    def _analyze_cfa(self, img: np.ndarray) -> float:
        """
        Estimates if a Bayer pattern exists.
        Real cameras interpolate RGB from Bayer (GRBG, etc.), leaving correlation traces.
        AI generates RGB directly, so no such correlation exists.
        """
        # Simplified approach:
        # Calculate difference between Green channel and interpolated Red/Blue
        # If the error is too "perfect" or uncorrelated in a specific way, it's suspicious.
        
        # For this demo, we'll assume high probability of AI if it's too clean
        # In a real system, we'd use the algorithm from "Universal Multimedia Forensics"
        
        return 0.8 # Placeholder: assumes AI for now to demonstrate the flag
