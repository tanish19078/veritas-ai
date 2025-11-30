import os
import cv2
import numpy as np
from PIL import Image
from typing import Dict, Any

try:
    import torch
    from torchvision import transforms
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

from app.layers.layer1_metadata import MetadataAnalyzer
from app.layers.layer2_biology import BiologicalAnalyzer
from app.layers.layer3_math import MathAnalyzer
from app.layers.layer4_hybrid_model import AIModelAnalyzer
from app.layers.layer5_physics import PhysicsAnalyzer
from app.layers.layer6_early_signature import EarlySignatureAnalyzer
from app.layers.layer7_ela import ELAAnalyzer

class ForensicsOrchestrator:
    def __init__(self):
        self.layer1 = MetadataAnalyzer()
        self.layer2 = BiologicalAnalyzer()
        self.layer3 = MathAnalyzer()
        self.layer4 = AIModelAnalyzer()
        self.layer5 = PhysicsAnalyzer()
        self.layer6 = EarlySignatureAnalyzer()
        self.layer7 = ELAAnalyzer()
        
        if HAS_TORCH:
            self.transform = transforms.Compose([
                transforms.Resize((224, 224)),
                transforms.ToTensor(),
                transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
            ])
        else:
            self.transform = None

    def analyze_media(self, file_path: str) -> Dict[str, Any]:
        if not os.path.exists(file_path):
            return {"error": "File not found"}

        # Determine type
        ext = os.path.splitext(file_path)[1].lower()
        is_video = ext in ['.mp4', '.avi', '.mov', '.mkv']
        
        results = {
            "verdict": "Inconclusive",
            "confidence": 0.0,
            "layer_scores": {},
            "explanation": "",
            "details": {},
            "ela_url": None
        }
        
        # Layer 1: Metadata
        l1_res = self.layer1.analyze(file_path)
        results["layer_scores"]["metadata"] = l1_res["score"]
        results["details"]["metadata"] = l1_res
        
        # Bubble up verification status
        results["is_verified"] = l1_res["details"].get("provenance_verified", False)
        results["c2pa_data"] = l1_res["details"].get("c2pa", {})
        
        # Layer 2: Biology
        if is_video:
            l2_res = self.layer2.analyze_video(file_path)
        else:
            l2_res = self.layer2.analyze_image(file_path)
        results["layer_scores"]["biology_rppg"] = l2_res["score"]
        results["details"]["biology"] = l2_res
        
        # Layer 3: Math (Image only for now, or first frame of video)
        if is_video:
            # Extract first frame
            cap = cv2.VideoCapture(file_path)
            ret, frame = cap.read()
            cap.release()
            if ret:
                temp_img_path = file_path + "_frame0.jpg"
                cv2.imwrite(temp_img_path, frame)
                l3_res = self.layer3.analyze(temp_img_path)
                os.remove(temp_img_path)
            else:
                l3_res = {"score": 0, "details": {}, "anomalies": []}
        else:
            l3_res = self.layer3.analyze(file_path)
        results["layer_scores"]["math_forensics"] = l3_res["score"]
        results["details"]["math"] = l3_res
        
        # Layer 4: AI Model
        try:
            if HAS_TORCH and self.transform:
                if is_video:
                    # Use first frame
                    cap = cv2.VideoCapture(file_path)
                    ret, frame = cap.read()
                    cap.release()
                    if ret:
                        img_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
                    else:
                        img_pil = Image.new('RGB', (224, 224))
                else:
                    img_pil = Image.open(file_path).convert('RGB')
                    
                img_tensor = self.transform(img_pil).unsqueeze(0)
                l4_score = self.layer4.analyze(img_tensor)
            else:
                # Fallback to path-based analysis (Statistical)
                l4_score = self.layer4.analyze(file_path)
            results["layer_scores"]["ai_model"] = l4_score
        except Exception as e:
            print(f"Layer 4 error: {e}")
            results["layer_scores"]["ai_model"] = 0.5 # Neutral
            
        # Layer 5: Physics
        if is_video:
             # Skip for video in this simplified version
             l5_res = {"score": 0, "details": {}, "anomalies": []}
        else:
            l5_res = self.layer5.analyze(file_path)
        results["layer_scores"]["physics"] = l5_res["score"]
        
        # Layer 6: Early Signature
        l6_res = self.layer6.analyze(file_path)
        results["layer_scores"]["early_signature"] = l6_res["score"]

        # Layer 7: ELA (Image only)
        if not is_video:
            output_dir = os.path.dirname(file_path)
            l7_res = self.layer7.analyze(file_path, output_dir)
            results["ela_url"] = l7_res["ela_image_path"]
        
        # Final Aggregation
        # Weighted average
        weights = {
            "metadata": 0.1,
            "biology_rppg": 0.2,
            "math_forensics": 0.3,
            "ai_model": 0.3,
            "physics": 0.05,
            "early_signature": 0.05
        }
        
        total_score = 0
        total_weight = 0
        
        for key, weight in weights.items():
            if key in results["layer_scores"]:
                total_score += results["layer_scores"][key] * weight
                total_weight += weight
                
        final_score = total_score / total_weight if total_weight > 0 else 0
        results["confidence"] = round(final_score, 3)
        
        if final_score > 0.75:
            results["verdict"] = "AI-Generated"
        elif final_score > 0.4:
            results["verdict"] = "Suspicious / Inconclusive"
        else:
            results["verdict"] = "Real"
            
        # Generate Explanation
        anomalies = []
        anomalies.extend(l1_res.get("anomalies", []))
        anomalies.extend(l2_res.get("anomalies", []))
        anomalies.extend(l3_res.get("anomalies", []))
        
        if not anomalies and final_score < 0.3:
            results["explanation"] = "No significant artifacts found. Content appears authentic."
        elif not anomalies and final_score >= 0.3:
            results["explanation"] = "No specific anomalies flagged, but statistical models indicate potential manipulation."
        else:
            results["explanation"] = f"Flagged as {results['verdict']} due to: " + "; ".join(anomalies)
            
        return results
