# Veritas AI: Technical Architecture & Roadmap
## Engineering Deep Dive

### System Architecture
Veritas AI is a modular, multi-layer forensics pipeline built for extensibility and high-throughput analysis.

*   **Frontend:** Next.js 14 (React), Tailwind CSS, Chart.js for visualization.
*   **Backend:** FastAPI (Python), NumPy/OpenCV for image processing, PyTorch for inference.
*   **Database:** SQLite (SQLAlchemy ORM) for analysis history and audit logs.
*   **Deployment:** Dockerized containers, Vercel-ready frontend.

### The 6-Layer Detection Pipeline (Technical Specs)

#### Layer 1: Metadata & Provenance
*   **Current Implementation:** Extracts EXIF data and file header magic numbers. Detects stripped metadata (common in AI output) and editing software signatures (Photoshop, GIMP).
*   **Upgrade Path:** Integration of **C2PA (Coalition for Content Provenance and Authenticity)** using `c2pa-python` to verify cryptographically signed media provenance (Adobe/Microsoft standard).

#### Layer 2: Biological Signals (rPPG)
*   **Algorithm:** **Remote Photoplethysmography (rPPG)**.
*   **Logic:** Extracts ROI (Region of Interest) on the face (forehead/cheeks). Analyzes subtle color variations in the Green channel over time (video frames) to estimate a blood volume pulse (BVP).
*   **Detection:** Absence of a consistent BVP signal or irregular frequency indicates a synthetic generation.

#### Layer 3: Mathematical Forensics
*   **Algorithms:**
    *   **FFT (Fast Fourier Transform):** Converts image to frequency domain to spot high-frequency anomalies.
    *   **DCT (Discrete Cosine Transform):** Analyzes JPEG compression artifacts. Double compression often indicates tampering.
    *   **CFA (Color Filter Array) Analysis:** Checks for Bayer pattern consistency.

#### Layer 4: Hybrid AI Model (Statistical & ML)
*   **Current Implementation:**
    *   **Laplacian Variance:** Measures image sharpness/blur. AI faces often have inconsistent focus compared to the background.
    *   **Histogram Entropy:** Calculates pixel intensity distribution. AI images often have "flatter" or statistically distinct histograms compared to natural camera sensors.
*   **Fallback:** Runs purely on CPU with OpenCV if PyTorch/GPU is unavailable.

#### Layer 5: Physics & Lighting
*   **Logic:** 2D Lighting Direction Estimation.
*   **Method:** Estimates the light source vector for the face and compares it to the background or other objects. Inconsistencies (e.g., face lit from left, background from right) trigger a high fake score.

#### Layer 6: Early Direct AI Signatures
*   **Algorithm:** **Frequency Domain Artifact Detection**.
*   **Logic:** Generative Adversarial Networks (GANs) and Diffusion models often leave "checkerboard" artifacts due to upsampling layers (Transposed Convolutions).
*   **Detection:** We run 2D FFT and look for periodic peaks in the high-frequency spectrum that represent these grid artifacts.

#### Layer 7: Error Level Analysis (ELA)
*   **Visualization:** Resaves the image at 95% JPEG quality and computes the difference `|Original - Resaved|`.
*   **Output:** Generates an "X-Ray" image where manipulated regions (spliced/inpainted) appear significantly brighter due to higher error levels (loss of compression coherence).

### API Integration Plan (Immediate Next Steps)

1.  **C2PA Integration:**
    *   **Library:** `c2pa-python`
    *   **Action:** Verify digital signatures on incoming media. If a valid C2PA manifest exists from a trusted issuer (e.g., BBC, Sony), the "Real" confidence is boosted significantly.

2.  **SynthID (Text only for now):**
    *   *Note:* Google's SynthID for *images* is not yet a public API.
    *   **Strategy:** Monitor Google Cloud Vertex AI updates for SynthID Image API release.

3.  **Scalability:**
    *   Move heavy ML inference (Layers 2, 4, 6) to a separate worker queue (Celery/Redis) to prevent blocking the main API thread during high load.

### Tech Stack Summary
| Component | Technology |
| :--- | :--- |
| **Language** | Python 3.10+ |
| **Web Framework** | FastAPI |
| **Computer Vision** | OpenCV, Pillow |
| **Math/Stats** | NumPy, SciPy |
| **ML Framework** | PyTorch (Optional/CPU-fallback) |
| **Frontend** | Next.js, TypeScript |
