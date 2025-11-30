import cv2
import numpy as np
from typing import Dict, Any

class EarlySignatureAnalyzer:
    """
    Layer 6: Early Direct AI Signature Detection
    - Frequency Domain Analysis (FFT) for high-frequency artifacts (star patterns)
    - Grid Artifact Detection (Periodic patterns from GANs/Diffusion upsamplers)
    """
    
    def analyze(self, image_path: str) -> Dict[str, Any]:
        results = {
            "score": 0.0,
            "details": {},
            "anomalies": []
        }
        
        try:
            # Load image in grayscale
            img = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
            if img is None:
                return results

            # Resize for consistent analysis if too large
            if img.shape[0] > 1024 or img.shape[1] > 1024:
                img = cv2.resize(img, (1024, 1024))
            
            # --- 1. Frequency Domain Analysis (FFT) ---
            # AI generators (GANs/Diffusion) often leave high-frequency artifacts
            # visible as bright spots or star patterns in the FFT magnitude spectrum.
            
            f = np.fft.fft2(img)
            fshift = np.fft.fftshift(f)
            magnitude_spectrum = 20 * np.log(np.abs(fshift) + 1e-7)
            
            # Analyze high frequencies (outer region of the spectrum)
            h, w = magnitude_spectrum.shape
            center_h, center_w = h // 2, w // 2
            
            # Mask out the low frequencies (center)
            mask_radius = int(min(h, w) * 0.15)
            y, x = np.ogrid[:h, :w]
            mask = (x - center_w)**2 + (y - center_h)**2 > mask_radius**2
            
            high_freq_spectrum = magnitude_spectrum * mask
            
            # Calculate mean energy of high frequencies
            # Real images usually have decaying energy. High energy here implies artifacts.
            high_freq_mean = np.mean(high_freq_spectrum[mask])
            high_freq_max = np.max(high_freq_spectrum[mask])
            
            # Heuristic: If high freq energy is abnormally high relative to image size/content
            # This is a simplification.
            
            # --- 2. Grid Artifact Detection (Periodic Noise) ---
            # We can detect peaks in the FFT spectrum that are off-center.
            # Find peaks in the high_freq_spectrum
            
            # Threshold for peak detection (e.g., 3 std devs above mean)
            threshold = np.mean(high_freq_spectrum[mask]) + 3 * np.std(high_freq_spectrum[mask])
            peaks = np.sum(high_freq_spectrum > threshold)
            
            # Scoring
            # More peaks = more likely artificial (checkerboard artifacts)
            # Normal images have few distinct peaks in high freq, mostly noise.
            
            # Normalize scores (Heuristics based on typical values)
            # High freq mean > 150 is suspicious (depends on log scale scaling)
            # Peaks > 50 is suspicious
            
            fft_score = min(high_freq_mean / 200.0, 1.0) # 0-1
            peak_score = min(peaks / 100.0, 1.0) # 0-1
            
            final_score = (fft_score * 0.4) + (peak_score * 0.6)
            
            results["score"] = round(final_score, 3)
            results["details"]["fft_high_freq_mean"] = float(high_freq_mean)
            results["details"]["fft_peaks"] = int(peaks)
            
            if final_score > 0.6:
                results["anomalies"].append("High-frequency periodic artifacts detected (Grid/Checkerboard)")
            
        except Exception as e:
            print(f"Layer 6 error: {e}")
            results["details"]["error"] = str(e)
            
        return results
