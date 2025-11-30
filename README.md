<h1>
  <img src="https://github.com/tanish19078/veritas-ai/blob/main/deepfake_forensics/frontend/public/logo.svg" alt="Veritas AI Logo" width="60" style="vertical-align: middle; margin-right: 10px;">
  Veritas AI: Universal Multi-Layer Deepfake Forensics System
</h1>


**Veritas AI** is a state-of-the-art, defense-in-depth forensics platform designed to detect AI-generated media (Deepfakes). Unlike single-model detectors, Veritas AI employs a **7-layer analysis pipeline** to scrutinize media from every angle—metadata, biology, physics, and mathematics.
```mermaid
graph TD
    %% Input
    Input[("🖼️ Suspicious Image")]:::inputStyle
    Gate{Veritas AI Security Checkpoint}:::gateStyle

    %% 7 Layers
    L1["Metadata & Provenance 📄"]:::layer1
    L2["Biological Signals 🩺"]:::layer2
    L3["Mathematical Forensics 📐"]:::layer3
    L4["Hybrid AI Model 🤖"]:::layer4
    L5["Physics & Lighting 💡"]:::layer5
    L6["Early Signature Detection 🔬"]:::layer6
    L7["Error Level Analysis 🔍"]:::layer7

    %% Analysis & Verdict
    Analysis["🧠 Synthesis Engine"]:::analysis
    Verdict{{"✅ REAL or ❌ FAKE"}}:::verdict

    %% Connections
    Input --> Gate
    Gate --> L1 & L2 & L3 & L4 & L5 & L6 & L7
    L1 & L2 & L3 & L4 & L5 & L6 & L7 --> Analysis --> Verdict

    %% Styling
    classDef inputStyle fill:#d0f0f7,stroke:#00838f,stroke-width:3px,color:#004d4d,font-weight:bold,font-family:monospace
    classDef gateStyle fill:#fff4e1,stroke:#fb8c00,stroke-width:3px,color:#6d4c41,font-weight:bold,font-family:monospace
    classDef layer1 fill:#fce4ec,stroke:#d81b60,stroke-width:2px,color:#880e4f,font-weight:bold,font-family:monospace
    classDef layer2 fill:#e8f5e9,stroke:#43a047,stroke-width:2px,color:#1b5e20,font-weight:bold,font-family:monospace
    classDef layer3 fill:#fff8e1,stroke:#fbc02d,stroke-width:2px,color:#f57f17,font-weight:bold,font-family:monospace
    classDef layer4 fill:#e3f2fd,stroke:#1e88e5,stroke-width:2px,color:#0d47a1,font-weight:bold,font-family:monospace
    classDef layer5 fill:#fff3e0,stroke:#fb8c00,stroke-width:2px,color:#e65100,font-weight:bold,font-family:monospace
    classDef layer6 fill:#f3e5f5,stroke:#8e24aa,stroke-width:2px,color:#4a148c,font-weight:bold,font-family:monospace
    classDef layer7 fill:#e0f7fa,stroke:#00acc1,stroke-width:2px,color:#006064,font-weight:bold,font-family:monospace
    classDef analysis fill:#c5cae9,stroke:#3949ab,stroke-width:3px,color:#1a237e,font-weight:bold,font-family:monospace
    classDef verdict fill:#fff9c4,stroke:#fbc02d,stroke-width:3px,color:#f57f17,font-weight:bold,font-family:monospace

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
