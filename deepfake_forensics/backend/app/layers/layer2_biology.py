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

        green_signals = []
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

                # Extract Green channel average
                # Green channel contains strongest PPG signal
                g_mean = np.mean(roi[:, :, 1])
                green_signals.append(g_mean)
                face_frames += 1
            # Frames without a face carry no biological signal and are skipped
            # entirely instead of being recorded as zeros.

        cap.release()

        results["details"]["frames_read"] = frames_read
        results["details"]["face_frames"] = face_frames

        # Analyze the signal
        green_signals = np.array(green_signals, dtype=np.float64)

        if len(green_signals) < 30:
            results["details"]["note"] = "Insufficient face frames for rPPG; layer abstains"
            return results

        # Calculate variance/std dev
        std_dev = np.std(green_signals)

        # AI generated videos often have very low temporal variance in skin tone (flatline)
        # Real videos have micro-fluctuations due to blood flow
        results["details"]["signal_std_dev"] = float(std_dev)

        # FFT pulse-band check: a living face shows a periodic skin-color
        # component in the 0.7-4.0 Hz band (~42-240 BPM). Detrend the signal,
        # apply a Hann window, and measure the dominant peak inside the band.
        peak_hz, pulse_snr = self._pulse_band_metrics(green_signals, fps)

        has_pulse = pulse_snr is not None and pulse_snr >= self.PULSE_SNR_THRESHOLD

        results["details"]["pulse_band"] = {
            "peak_hz": peak_hz,
            "snr": pulse_snr,
            "estimated_bpm": round(peak_hz * 60.0, 1) if peak_hz is not None else None,
            "detected": bool(has_pulse),
        }

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
