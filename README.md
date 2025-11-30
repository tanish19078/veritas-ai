<h1>
  <img src="https://github.com/tanish19078/veritas-ai/blob/main/deepfake_forensics/frontend/public/logo.svg" alt="Veritas AI Logo" width="60" style="vertical-align: middle; margin-right: 10px;">
  Veritas AI: Universal Multi-Layer Deepfake Forensics System
</h1>


**Veritas AI** is a state-of-the-art, defense-in-depth forensics platform designed to detect AI-generated media (Deepfakes). Unlike single-model detectors, Veritas AI employs a **7-layer analysis pipeline** to scrutinize media from every angle—metadata, biology, physics, and mathematics.
```mermaid
flowchart LR
    %% Input
    Input[("🖼️ Suspicious Image/Video")]:::inputStyle

    %% Security Checkpoint
    Gate{Veritas AI Security Checkpoint}:::gateStyle

    %% Layers
    subgraph Layers["🛡️ 6 Layers of Defense"]
        style Layers fill:#f4f4f4,stroke:#999,stroke-dasharray: 5 5
        G1["1. The ID Checker 🪪<br><i>File history & digital signature</i>"]:::layer1
        G2["2. The Doctor 🩺<br><i>Heartbeat / rPPG detection</i>"]:::layer2
        G3["3. The Mathematician 📐<br><i>Pixel & frequency analysis</i>"]:::layer3
        G4["4. The Detective 🕵️<br><i>AI trained to spot AI</i>"]:::layer4
        G5["5. The Physicist 💡<br><i>Lighting & shadow consistency</i>"]:::layer5
        G6["6. The Specialist 🔬<br><i>AI tool fingerprints</i>"]:::layer6
    end

    %% Analysis & Verdict
    Analysis["🧠 Synthesis Engine<br><i>Combines all clues</i>"]:::analysis
    Verdict{{"✅ REAL or ❌ FAKE"}}:::verdict

    %% Connections
    Input --> Gate
    Gate --> G1 & G2 & G3 & G4 & G5 & G6
    G1 & G2 & G3 & G4 & G5 & G6 --> Analysis --> Verdict

    %% Styling
    classDef inputStyle fill:#9cf,stroke:#333,stroke-width:2px,color:#000,font-weight:bold
    classDef gateStyle fill:#fc9,stroke:#333,stroke-width:2px,color:#000,font-weight:bold
    classDef layer1 fill:#ffd1dc,stroke:#c33,stroke-width:1px
    classDef layer2 fill:#c1f0f6,stroke:#39a,stroke-width:1px
    classDef layer3 fill:#ffe4a3,stroke:#f90,stroke-width:1px
    classDef layer4 fill:#d7d7ff,stroke:#33c,stroke-width:1px
    classDef layer5 fill:#c1f6c1,stroke:#0a3,stroke-width:1px
    classDef layer6 fill:#f0d1c1,stroke:#c63,stroke-width:1px
    classDef analysis fill:#a0a0a0,stroke:#000,stroke-width:2px,color:white,font-weight:bold
    classDef verdict fill:#bbf,stroke:#333,stroke-width:2px,color:black,font-weight:bold

```
## 🛡️ The 7 Layers of Defense

1.  **Metadata & Provenance**: Analyzes file headers, EXIF data, and C2PA manifests for inconsistencies.
2.  **Biological Signals (rPPG)**: Detects the subtle color changes in human skin caused by blood flow (pulse), often missing in deepfakes.
3.  **Mathematical Forensics**: Uses FFT (Fast Fourier Transform) and DCT to reveal hidden frequency-domain artifacts and grid patterns.
4.  **Hybrid AI Model**: A dual-branch neural network (CNN + Transformer) detecting texture anomalies and semantic inconsistencies.
5.  **Physics & Lighting**: Checks for consistent lighting direction and eye reflection symmetry.
6.  **Early Signature Detection**: Identifies fingerprints of specific generative models (GANs, Diffusion).
7.  **Error Level Analysis (ELA)**: A visual "X-Ray" tool that highlights compression differences to detect splicing.

## 🚀 Features

*   **Universal Dashboard**: A minimalist, "Figma-style" web interface.
*   **Multi-Upload**: Batch process multiple images and videos simultaneously.
*   **Real-Time Webcam Mode**: Analyze your own face live in the browser.
*   **Detailed Visualizations**: Radar charts, spectral heatmaps, and pulse graphs.
*   **Exportable Reports**: Download comprehensive CSV reports of your analysis.
*   **Deployment Ready**: Configured for Vercel and Docker.

## 🛠️ Installation

### Prerequisites
*   Python 3.9+
*   Node.js 16+
*   Git

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/veritas-ai.git
cd veritas-ai
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
# Windows
.\venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
*Backend runs on `http://localhost:8000`*

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

## 📖 Usage

1.  Open the dashboard at `http://localhost:3000`.
2.  **Upload Analysis**: Drag and drop images or videos. The system will process them through all 7 layers.
3.  **View Results**: Click on a file to see the detailed breakdown.
    *   **Verdict**: Real vs. AI-Generated.
    *   **Confidence**: Probability score.
    *   **ELA**: Toggle the "Eye" icon to see the Error Level Analysis X-Ray.
4.  **Live Webcam**: Switch to the "Live Webcam" tab to test the rPPG engine in real-time.

## 🏗️ Technology Stack

*   **Backend**: FastAPI, PyTorch, OpenCV, NumPy, SciPy
*   **Frontend**: Next.js, TypeScript, Tailwind CSS, Chart.js, Lucide React
*   **Deployment**: Docker, Vercel

## 📄 License

MIT License. See [LICENSE](LICENSE) for details.
