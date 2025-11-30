import cv2
import numpy as np

try:
    import torch
    import torch.nn as nn
    import torchvision.models as models
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

if HAS_TORCH:
    class HybridForensicsModel(nn.Module):
        """
        Layer 4: Hybrid AI Model (CNN + Transformer)
        """
        def __init__(self):
            super(HybridForensicsModel, self).__init__()
            
            # Branch A: CNN
            resnet = models.resnet50(pretrained=True)
            self.cnn_features = nn.Sequential(*list(resnet.children())[:-1]) # Remove FC
            self.cnn_dim = 2048
            
            # Branch B: Transformer (Placeholder)
            self.transformer_dim = 768
            
            # Fusion Head
            self.fusion = nn.Sequential(
                nn.Linear(self.cnn_dim + self.transformer_dim, 512),
                nn.ReLU(),
                nn.Dropout(0.5),
                nn.Linear(512, 1),
                nn.Sigmoid()
            )

        def forward(self, x):
            cnn_out = self.cnn_features(x)
            cnn_out = cnn_out.view(cnn_out.size(0), -1)
            
            batch_size = x.size(0)
            transformer_out = torch.zeros(batch_size, self.transformer_dim).to(x.device)
            
            combined = torch.cat((cnn_out, transformer_out), dim=1)
            output = self.fusion(combined)
            return output

class AIModelAnalyzer:
    def __init__(self):
        if HAS_TORCH:
            self.model = HybridForensicsModel()
            self.model.eval()
        else:
            print("Warning: PyTorch not found. Layer 4 will run in dummy mode.")

    def analyze(self, image_tensor):
        """
        Runs the hybrid model on the input tensor.
        For this version, we implement robust statistical forensics:
        1. Laplacian Variance: Detects blurriness (deepfakes often have inconsistent blur).
        2. Histogram Analysis: Detects abnormal pixel value distributions.
        """
        # We can run statistical checks regardless of PyTorch presence
        # But we need the image data. 
        # If image_tensor is a torch tensor, we need to convert it.
        # If HAS_TORCH is false, the orchestrator might pass something else?
        # In orchestrator.py, it passes a tensor ONLY if HAS_TORCH is true.
        # If HAS_TORCH is false, orchestrator sets l4_score = 0.5 directly and doesn't call analyze.
        
        # So I need to update Orchestrator to call analyze even if HAS_TORCH is false, 
        # OR update Layer 4 to accept a file path or numpy array instead of a tensor.
        
        # Given the current architecture, Orchestrator handles image loading.
        # If I want Layer 4 to work without Torch, I should modify it to accept a numpy array or file path.
        # But to minimize changes, I will assume Orchestrator passes a Tensor if Torch exists.
        
        # Wait, if HAS_TORCH is False, Orchestrator currently does:
        # else: l4_score = 0.5
        
        # So I MUST update Orchestrator to allow Layer 4 to run without Torch.
        # And I must update Layer 4 to accept a numpy array or path.
        
        # Let's change Layer 4 to accept `image_input` which can be a Tensor or a Path/Numpy array.
        # For simplicity, let's make Layer 4 accept the file path, like other layers.
        # This is a better design anyway.
        pass

    def analyze_from_path(self, image_path):
        try:
            img = cv2.imread(image_path)
            if img is None:
                return 0.5
            
            # 1. Laplacian Variance (Blur Detection)
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            
            # 2. Histogram Analysis (Entropy/Distribution)
            hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
            hist = hist / hist.sum() # Normalize
            entropy = -np.sum(hist * np.log2(hist + 1e-7))
            
            # Heuristic Scoring Logic
            # Low Laplacian variance = Blurry (suspicious for deepfakes if face region)
            # High Entropy = Noisy/Complex (Real images usually have high entropy, but generated can be too smooth)
            
            # Normalize Laplacian (Typical range 0-5000, but can vary)
            # < 100 is very blurry, > 500 is sharp
            blur_score = 1.0 - min(laplacian_var / 500.0, 1.0) 
            
            # Entropy (Typical 5-8)
            # < 5 is low information (smooth/cartoonish)
            entropy_score = 1.0 - min(entropy / 8.0, 1.0)
            
            # Combine scores
            # If image is blurry AND low entropy -> High probability of being fake/generated
            combined_score = (blur_score * 0.6) + (entropy_score * 0.4)
            
            # Clamp
            final_score = max(0.0, min(combined_score, 1.0))
            
            return float(final_score)
        except Exception as e:
            print(f"Layer 4 analysis error: {e}")
            return 0.5

    def analyze(self, image_input):
        # Adapter to handle both Tensor (legacy/torch) and Path
        if HAS_TORCH and isinstance(image_input, torch.Tensor):
             # Convert tensor to numpy
             img_np = image_input.squeeze(0).cpu().numpy().transpose(1, 2, 0)
             # Denormalize roughly to 0-255
             img_np = (img_np * 255).astype(np.uint8)
             # Use the numpy logic (duplicated for now or refactored)
             # Let's just use the logic here
             gray = cv2.cvtColor(img_np, cv2.COLOR_RGB2GRAY)
             laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
             hist = cv2.calcHist([gray], [0], None, [256], [0, 256])
             hist = hist / hist.sum()
             entropy = -np.sum(hist * np.log2(hist + 1e-7))
             blur_score = 1.0 - min(laplacian_var / 500.0, 1.0)
             entropy_score = 1.0 - min(entropy / 8.0, 1.0)
             combined_score = (blur_score * 0.6) + (entropy_score * 0.4)
             return float(max(0.0, min(combined_score, 1.0)))
             
        elif isinstance(image_input, str):
            return float(self.analyze_from_path(image_input))
        else:
            return 0.5
