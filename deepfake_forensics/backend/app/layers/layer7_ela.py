import cv2
import numpy as np
import os
import uuid
from PIL import Image, ImageChops, ImageEnhance
from typing import Dict, Any

class ELAAnalyzer:
    """
    Layer 7: Error Level Analysis (ELA)
    - Resaves image at 95% quality.
    - Computes difference between original and resaved.
    - Enhances brightness of difference to visualize compression artifacts.
    - High ELA values in specific regions indicate potential manipulation (splicing).
    """

    def analyze(self, image_path: str, output_dir: str) -> Dict[str, Any]:
        results = {
            "score": None,
            "details": {},
            "ela_image_path": None,
            "anomalies": []
        }
        
        try:
            original = Image.open(image_path).convert('RGB')
            
            # 1. Resave at 95% quality
            temp_resaved = os.path.join(output_dir, f"temp_ela_{uuid.uuid4().hex}.jpg")
            original.save(temp_resaved, 'JPEG', quality=95)
            resaved = Image.open(temp_resaved)
            
            # 2. Compute Difference
            ela_image = ImageChops.difference(original, resaved)
            
            # 3. Enhance Extrema (Brightness)
            extrema = ela_image.getextrema()
            max_diff = max([ex[1] for ex in extrema])
            if max_diff == 0:
                max_diff = 1
            scale = 255.0 / max_diff
            
            ela_image = ImageEnhance.Brightness(ela_image).enhance(scale * 10) # Amplify for visibility
            
            # Save ELA result
            filename = os.path.basename(image_path)
            ela_output_path = os.path.join(output_dir, f"ela_{filename}")
            ela_image.save(ela_output_path)
            
            # Cleanup
            if os.path.exists(temp_resaved):
                os.remove(temp_resaved)
                
            results["ela_image_path"] = f"/uploads/ela_{filename}" # Relative path for frontend
            
            # 4. Scoring (Heuristic)
            # Calculate average brightness of ELA image
            # High average brightness = high compression error = potentially resaved many times or manipulated
            # Localized bright spots are the real key, but hard to score automatically without segmentation.
            
            np_ela = np.array(ela_image)
            avg_brightness = np.mean(np_ela)
            brightness_std = np.std(np_ela)
            
            results["details"]["avg_ela_brightness"] = float(avg_brightness)
            results["details"]["ela_brightness_std"] = float(brightness_std)
            
            # ELA is strongest as a visualization. Use a conservative weak score
            # so it can support other signals without dominating the verdict.
            brightness_score = min(float(avg_brightness) / 96.0, 1.0)
            variance_score = min(float(brightness_std) / 96.0, 1.0)
            results["score"] = round((brightness_score * 0.4) + (variance_score * 0.6), 3)

            if results["score"] > 0.65:
                results["anomalies"].append("High ELA response; inspect highlighted regions for edits")
            
        except Exception as e:
            print(f"ELA Error: {e}")
            results["details"]["error"] = str(e)
            
        return results
