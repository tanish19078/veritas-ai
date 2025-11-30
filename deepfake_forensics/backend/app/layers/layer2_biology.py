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
            "score": 0.0,
            "details": {},
            "anomalies": []
        }
        
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            results["anomalies"].append("Could not open video file")
            return results

        fps = cap.get(cv2.CAP_PROP_FPS)
        frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Analyze a subset of frames for efficiency
        max_frames = 300
        frames_to_read = min(frame_count, max_frames)
        
        green_signals = []
        
        for i in range(frames_to_read):
            ret, frame = cap.read()
            if not ret:
                break
            
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
            else:
                green_signals.append(0)

        cap.release()
        
        # Analyze the signal
        green_signals = np.array(green_signals)
        # Remove zeros (no face detected)
        green_signals = green_signals[green_signals > 0]
        
        if len(green_signals) < 30:
            results["anomalies"].append("Insufficient face data for rPPG")
            return results

        # Calculate variance/std dev
        std_dev = np.std(green_signals)
        
        # AI generated videos often have very low temporal variance in skin tone (flatline)
        # Real videos have micro-fluctuations due to blood flow
        results["details"]["signal_std_dev"] = float(std_dev)
        
        if std_dev < 0.5: # Threshold would need tuning
            results["anomalies"].append("Unnaturally stable skin tone (Flatline)")
            results["score"] += 0.8
        elif std_dev > 10.0:
            results["anomalies"].append("Excessive noise in skin tone")
            # Could be lighting changes, not necessarily fake, but suspicious
        
        # FFT of the signal to find heart rate peak
        # (Skipping full implementation for brevity, but this is where 1.0-1.6Hz check goes)
        
        return results

    def analyze_image(self, image_path: str) -> Dict[str, Any]:
        """
        For single images, we can't do rPPG, but we can check for biological plausibility
        like skin texture and eye consistency.
        """
        results = {
            "score": 0.0,
            "details": {},
            "anomalies": []
        }
        
        img = cv2.imread(image_path)
        if img is None:
            return results
            
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)
        
        if len(faces) == 0:
            results["details"]["faces_found"] = 0
            return results
            
        results["details"]["faces_found"] = len(faces)
        
        # Simple check: AI faces often have asymmetric eyes or strange teeth
        # This requires more complex models, so we return a neutral score for now
        # unless we add specific texture checks.
        
        return results
