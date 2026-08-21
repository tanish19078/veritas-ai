import cv2
import numpy as np
from typing import Dict, Any, List

class BiologicalAnalyzer:
    """
    Layer 2: Biological Signal Detection (rPPG)
    - Face ROI extraction
    - rPPG / Eulerian Video Magnification (Simplified)
    - Pulse waveform reconstruction
    - "Flatline" detector for AI faces
    """

    PULSE_BAND_LOW_HZ = 0.7   # ~42 BPM
    PULSE_BAND_HIGH_HZ = 4.0  # ~240 BPM
    PULSE_SNR_THRESHOLD = 0.30

    def __init__(self):
        # Load face cascade classifier
        # In a real deployment, use a better detector like MTCNN or RetinaFace
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

    def analyze_video(self, video_path: str) -> Dict[str, Any]:
        """
        Analyzes a video for biological signals.
        For images, this is less effective but can check for skin tone consistency.
        """
        results = {
            "score": None,
            "details": {},
            "anomalies": []
        }

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            results["details"]["note"] = "Could not open video file"
            return results

        fps = cap.get(cv2.CAP_PROP_FPS)
        if not fps or fps <= 0:
            fps = 30.0
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

        # Analyze a subset of frames for efficiency
        max_frames = 300
        frames_to_read = min(frame_count, max_frames) if frame_count > 0 else max_frames

        bgr_signals = []
        face_frames = 0
        frames_read = 0

        for i in range(frames_to_read):
            ret, frame = cap.read()
            if not ret:
                break
            frames_read += 1

            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

            if len(faces) > 0:
                # Take the first face
                (x, y, w, h) = faces[0]
                # ROI: Forehead or cheeks are best, let's take center of face
                roi = frame[y:y+h, x:x+w]

                # Per-frame mean of each channel inside the face ROI.
                bgr_signals.append(np.mean(roi.reshape(-1, 3), axis=0))
                face_frames += 1
            # Frames without a face carry no biological signal and are skipped
            # entirely instead of being recorded as zeros.

        cap.release()

        results["details"]["frames_read"] = frames_read
        results["details"]["face_frames"] = face_frames

        if len(bgr_signals) < 30:
            results["details"]["note"] = "Insufficient face frames for rPPG; layer abstains"
            return results

        means = np.array(bgr_signals, dtype=np.float64)  # shape (n, 3), BGR order

        # Temporal variance of the green channel: AI generated videos often
        # have very low skin-tone variance (flatline).
        std_dev = float(np.std(means[:, 1]))
        results["details"]["signal_std_dev"] = std_dev

        # CHROM-based rPPG: project chrominance signals (invariant to motion
        # and lighting) onto the cardiac band and measure the dominant peak.
        pulse_signal = self._chrom_pulse_signal(means, fps)
        peak_hz, pulse_snr = self._pulse_band_metrics(pulse_signal, fps)

        has_pulse = pulse_snr is not None and pulse_snr >= self.PULSE_SNR_THRESHOLD

        results["details"]["pulse_band"] = {
            "method": "chrom",
            "peak_hz": peak_hz,
            "snr": pulse_snr,
            "estimated_bpm": round(peak_hz * 60.0, 1) if peak_hz is not None else None,
            "detected": bool(has_pulse),
        }
        results["details"]["waveform"] = self._downsample_waveform(pulse_signal)

        if has_pulse:
            # Cardiac-band activity is weak evidence of a living subject.
            results["score"] = 0.1
        elif std_dev < 0.5:
            # Flat, non-periodic skin signal: the classic deepfake tell.
            results["anomalies"].append("Unnaturally stable skin tone with no cardiac-band pulse (Flatline)")
            results["score"] = 0.8
        elif std_dev > 10.0:
            results["anomalies"].append("Excessive noise in skin tone")
            # Could be lighting changes, not necessarily fake, but suspicious

        return results

    @classmethod
    def _pulse_band_metrics(cls, signal: np.ndarray, fps: float):
        """
        Returns (peak_hz, snr) of the dominant frequency inside the
        cardiac band, or (None, None) when no band energy exists.
        snr is the fraction of band energy concentrated at the peak.
        """
        detrended = signal - np.mean(signal)
        n = len(detrended)
        spectrum = np.abs(np.fft.rfft(detrended * np.hanning(n)))
        freqs = np.fft.rfftfreq(n, d=1.0 / fps)

        band = (freqs >= cls.PULSE_BAND_LOW_HZ) & (freqs <= cls.PULSE_BAND_HIGH_HZ)
        if not band.any():
            return None, None

        band_energy = float(np.sum(spectrum[band]))
        if band_energy <= 1e-9:
            return None, None

        band_spectrum = spectrum[band]
        peak_idx = int(np.argmax(band_spectrum))
        peak_hz = float(freqs[band][peak_idx])
        snr = float(band_spectrum[peak_idx] / (band_energy + 1e-9))
        return peak_hz, snr

    @staticmethod
    def _bandpass(signal: np.ndarray, fps: float) -> np.ndarray:
        """Zeroes out spectrum outside the cardiac band (0.7-4.0 Hz)."""
        spectrum = np.fft.rfft(signal - np.mean(signal))
        freqs = np.fft.rfftfreq(len(signal), d=1.0 / fps)
        keep = (freqs >= BiologicalAnalyzer.PULSE_BAND_LOW_HZ) & (
            freqs <= BiologicalAnalyzer.PULSE_BAND_HIGH_HZ
        )
        spectrum[~keep] = 0
        return np.fft.irfft(spectrum, n=len(signal))

    @classmethod
    def _chrom_pulse_signal(cls, bgr_means: np.ndarray, fps: float) -> np.ndarray:
        """
        CHROM method (de Haan & Jeanne): builds chrominance signals X/Y that
        are robust to motion and lighting, then combines them with
        alpha = std(X)/std(Y) and bandpasses to the cardiac band.
        """
        # Input rows are BGR; reorder to R, G, B.
        rgb = np.stack(
            [bgr_means[:, 2], bgr_means[:, 1], bgr_means[:, 0]], axis=1
        ).astype(np.float64)

        norms = np.mean(rgb, axis=0)
        norms[norms < 1e-6] = 1e-6
        normalized = rgb / norms  # per-channel temporal normalization

        x_s = 3.0 * normalized[:, 0] - 2.0 * normalized[:, 1]
        y_s = 1.5 * normalized[:, 0] + normalized[:, 1] - 1.5 * normalized[:, 2]

        std_y = float(np.std(y_s))
        alpha = float(np.std(x_s)) / std_y if std_y > 1e-9 else 1.0

        return cls._bandpass(x_s - alpha * y_s, fps)

    @staticmethod
    def _downsample_waveform(signal: np.ndarray, max_points: int = 120):
        """Normalizes the pulse signal to [0, 1] for frontend plotting."""
        arr = np.asarray(signal, dtype=np.float64)
        if arr.size == 0:
            return []
        if arr.size > max_points:
            idx = np.linspace(0, arr.size - 1, max_points).astype(int)
            arr = arr[idx]
        span = float(np.max(arr) - np.min(arr))
        if span <= 1e-9:
            return [0.5] * int(arr.size)
        arr = (arr - np.min(arr)) / span
        return [round(float(v), 4) for v in arr]

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        For single images, we can't do rPPG, but we can check for biological plausibility
        like skin texture and eye consistency.
        """
        results = {
            "score": None,
            "details": {},
            "anomalies": []
        }

        img = cv2.imread(image_path)
        if img is None:
            results["details"]["note"] = "Image could not be decoded"
            return results

        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

        results["details"]["faces_found"] = len(faces)

        # Simple check: AI faces often have asymmetric eyes or strange teeth
        # This requires more complex models, so the layer abstains (no score)
        # instead of voting 0.0 ("Real") on every image it cannot judge.
        results["details"]["note"] = "Single-image rPPG not available; layer abstains"

        return results
