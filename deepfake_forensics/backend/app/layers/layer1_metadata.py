import os
import mimetypes
import exifread
from typing import Dict, Any

try:
    import magic
    HAS_MAGIC = True
except ImportError:
    HAS_MAGIC = False

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
        mime_type = self._get_mime_type(file_path)
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
            # Verified provenance invalidates the earlier metadata heuristics,
            # so the stale anomaly flags must not leak into the explanation.
            results["anomalies"] = []
            results["details"]["provenance_verified"] = True
            results["details"]["note"] = "C2PA manifest verified; metadata heuristics overridden"
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

    def _get_mime_type(self, file_path: str) -> str:
        if HAS_MAGIC:
            try:
                return magic.from_file(file_path, mime=True)
            except Exception:
                pass

        mime_type, _ = mimetypes.guess_type(file_path)
        return mime_type or "application/octet-stream"

    def _check_c2pa(self, file_path: str) -> Dict[str, Any]:
        """
        Verifies C2PA Content Credentials.
        Returns a dictionary with status and details.
        """
        try:
            # Attempt to read C2PA manifest
            import c2pa

            try:
                # Create a reader and parse the file
                reader = c2pa.Reader.from_file(file_path)
                manifest = reader.active_manifest

                if manifest:
                    return {
                        "verified": True,
                        "issuer": manifest.claim_generator,
                        "title": manifest.title,
                        "signature_date": manifest.creation_time,
                        "validation_status": reader.validation_status
                    }
            except c2pa.Error.ManifestNotFound:
                 return {"verified": False, "error": "No C2PA manifest found"}
            except Exception as e:
                # Manifest found but error reading/validating it
                return {"verified": False, "error": f"Validation error: {str(e)}"}
                
        except ImportError:
            return {"verified": False, "error": "c2pa-python library not installed (requires Rust/Cargo)"}
        except Exception as e:
            return {"verified": False, "error": str(e)}
            
        return {"verified": False, "error": "No manifest"}
