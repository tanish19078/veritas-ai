import os
import cv2
import numpy as np
from app.core.orchestrator import ForensicsOrchestrator

def create_dummy_image(filename, pattern="noise"):
    img = np.zeros((224, 224, 3), dtype=np.uint8)
    if pattern == "noise":
        cv2.randn(img, (128, 128, 128), (50, 50, 50))
    elif pattern == "grid":
        # Simulate checkerboard artifact
        for i in range(0, 224, 8):
            for j in range(0, 224, 8):
                if (i//8 + j//8) % 2 == 0:
                    img[i:i+8, j:j+8] = 255
    
    cv2.imwrite(filename, img)
    return filename

def test_pipeline():
    print("Initializing Orchestrator...")
    orch = ForensicsOrchestrator()
    
    # Test 1: Noise Image (Should be Real/Inconclusive)
    print("\nTesting Noise Image...")
    img_path = create_dummy_image("test_noise.jpg", "noise")
    try:
        res = orch.analyze_media(img_path)
        print(f"Verdict: {res['verdict']}")
        print(f"Confidence: {res['confidence']}")
        print(f"Scores: {res['layer_scores']}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

    # Test 2: Grid Image (Should trigger FFT/Math layers)
    print("\nTesting Grid Image (Simulated AI Artifacts)...")
    img_path = create_dummy_image("test_grid.jpg", "grid")
    try:
        res = orch.analyze_media(img_path)
        print(f"Verdict: {res['verdict']}")
        print(f"Confidence: {res['confidence']}")
        print(f"Scores: {res['layer_scores']}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        if os.path.exists(img_path):
            os.remove(img_path)

if __name__ == "__main__":
    test_pipeline()
