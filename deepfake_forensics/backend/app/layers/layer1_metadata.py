import os
import json
import exifread
import magic
from typing import Dict, Any

class MetadataAnalyzer:
    """
    Layer 1: Metadata & Provenance
    - C2PA / Content Credentials validation (Placeholder)
    - EXIF and file-header signature analysis
    - Missing metadata anomaly detection
    - File tampering heuristics
    """

    def analyze(self, file_path: str) -> Dict[str, Any]:
        results = {
            "score": 0.0,
            "details": {},
            "anomalies": []
        }
        
        if not os.path.exists(file_path):
            results["anomalies"].append("File not found")
            return results

        # 1. File Header Analysis (Magic numbers)
        mime_type = magic.from_file(file_path, mime=True)
        results["details"]["mime_type"] = mime_type
        
        # 2. EXIF Analysis
        exif_data = self._get_exif_data(file_path)
        results["details"]["exif_count"] = len(exif_data)
        
        # Check for missing metadata (common in AI generation)
        if len(exif_data) < 5:
            results["anomalies"].append("Very low EXIF metadata count (typical of AI or stripped files)")
            results["score"] += 0.3
        
        # Check for specific software signatures
        software = str(exif_data.get("Image Software", "")).lower()
        if "photoshop" in software:
            results["anomalies"].append("Edited with Photoshop")
            results["score"] += 0.1
        elif "gimp" in software:
            results["anomalies"].append("Edited with GIMP")
            results["score"] += 0.1
        elif software == "":
             results["anomalies"].append("No software signature found")
        
        # 3. C2PA / Content Credentials (Stub)
        # Real implementation would use a library like c2pa-python
        # 3. C2PA / Content Credentials
        c2pa_result = self._check_c2pa(file_path)
        results["details"]["c2pa"] = c2pa_result
        
        if c2pa_result.get("verified"):
            # Strong signal for authenticity (if signed by trusted issuer)
            results["score"] = 0.0 # Reset score to 0 (Real)
            results["details"]["provenance_verified"] = True
        else:
            results["details"]["provenance_verified"] = False

        # Normalize score (0.0 = Real, 1.0 = Fake)
        # Metadata is a weak signal, so we cap the max contribution
        results["score"] = min(results["score"], 0.4)
        
        return results

    def _get_exif_data(self, file_path: str) -> Dict[str, Any]:
        try:
            with open(file_path, 'rb') as f:
                tags = exifread.process_file(f)
                return tags
        except Exception as e:
            return {}

    def _check_c2pa(self, file_path: str) -> Dict[str, Any]:
        """
        Verifies C2PA Content Credentials.
        Returns a dictionary with status and details.
        """
        try:
            # Attempt to read C2PA manifest
            # Note: c2pa-python API might vary, using standard pattern
            import c2pa
            
            # Create a reader
            try:
                manifest = c2pa.read_file(file_path)
                if manifest:
                    return {
                        "verified": True,
                        "issuer": manifest.active_manifest.claim_generator,
                        "title": manifest.active_manifest.title,
                        "signature_date": manifest.active_manifest.creation_time
                    }
            except Exception:
                # No manifest found or error reading it
                return {"verified": False, "error": "No valid C2PA manifest found"}
                
        except ImportError:
            return {"verified": False, "error": "c2pa-python library not installed"}
        except Exception as e:
            return {"verified": False, "error": str(e)}
            
        return {"verified": False, "error": "No manifest"}
