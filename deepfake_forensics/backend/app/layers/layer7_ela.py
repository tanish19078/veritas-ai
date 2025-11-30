import cv2
import numpy as np
import os
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
            "score": 0.0,
            "details": {},
            "ela_image_path": None
        }
        
        try:
            original = Image.open(image_path).convert('RGB')
            
            # 1. Resave at 95% quality
            temp_resaved = os.path.join(output_dir, "temp_ela.jpg")
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
            
            results["details"]["avg_ela_brightness"] = float(avg_brightness)
            
            # Normalize to 0-1 score (Arbitrary thresholding for demo)
            # Real images usually have low ELA response if original, high if resaved.
            # But manipulation is about *difference* in ELA across the image.
            # We'll return a neutral score but provide the image for "X-Ray".
            results["score"] = 0.0 
            
        except Exception as e:
            print(f"ELA Error: {e}")
            
        return results
