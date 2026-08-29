import React from 'react';
import Link from 'next/link';
import {
    Activity,
    ArrowLeft,
    BadgeCheck,
    BookOpen,
    CheckCircle2,
    Compass,
    Cpu,
    FileCode,
    FileSearch,
    Fingerprint,
    Info,
    Layers,
    Lightbulb,
    Ruler,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sliders,
    Sparkles,
    Waves,
} from 'lucide-react';

const LAYERS_DOC = [
    {
        num: '01',
        title: 'Metadata, File Headers & Cryptographic Provenance (C2PA)',
        icon: <FileSearch className="h-5 w-5 text-sky-600" />,
        badge: 'Weight: 10%',
        summary:
            'Extracts EXIF metadata, camera serial profiles, compression markers, and verifies C2PA Content Credentials manifests.',
        technicalDetails: [
            'Inspects magic number signatures at file headers (e.g. 0xFFD8FFE0 for JPEG, 0x89504E47 for PNG).',
            'Counts authentic camera EXIF tags (ISO, Shutter Speed, Lens Focal Length, Camera Make/Model). Synthetic media and web-scraped AI images typically contain < 5 tags.',
            'Identifies known editing suite traces (Adobe Photoshop, GIMP, FFmpeg re-encoders).',
            'Validates C2PA (Coalition for Content Provenance and Authenticity) cryptographic certificates. Verified manifests override heuristic voting.',
        ],
        formula: 'S_{metadata} = \\min(1.0, 0.3 \\times [N_{exif} < 5] + 0.1 \\times [Software_{tampered}])',
    },
    {
        num: '02',
        title: 'Biological Signals: Facial Skin Chrominance (CHROM rPPG)',
        icon: <Activity className="h-5 w-5 text-emerald-600" />,
        badge: 'Weight: 10%',
        summary:
            'Measures sub-dermal blood volume pulses from skin tone micro-variations across video frames in the cardiac frequency band.',
        technicalDetails: [
            'Applies the CHROM (Chrominance-based) rPPG projection algorithm to extract normalized blood volume pulse signals from facial skin ROIs.',
            'Filters the extracted signal with a Butterworth bandpass filter tuned to the human physiological cardiac band (0.7 Hz – 4.0 Hz, corresponding to 42 – 240 BPM).',
            'Computes the Fast Fourier Transform (FFT) of the filtered pulse wave to detect the presence of a dominant cardiac frequency peak.',
            'Deepfakes, neural face swaps, and diffusion video generators produce flatlined or noisy non-biological waveforms.',
        ],
        formula: 'S_{rppg} = 1.0 - \\mathrm{sigmoid}\\left(\\frac{\\mathrm{SNR}_{cardiac} - \\theta}{\\sigma}\\right)',
    },
    {
        num: '03',
        title: 'Mathematical Forensics: 2D FFT, DCT & CFA Bayer Noise',
        icon: <Ruler className="h-5 w-5 text-indigo-600" />,
        badge: 'Weight: 25%',
        summary:
            'Analyzes frequency domain periodicity and camera sensor Color Filter Array (Bayer pattern) noise correlation.',
        technicalDetails: [
            '2D Fast Fourier Transform (FFT): Exposes regular grid patterns and high-frequency sinc artifacts left by generative neural upsampling.',
            'Discrete Cosine Transform (DCT): Quantifies high-frequency energy concentration in 8x8 block residuals to detect double JPEG compression and synthetic textures.',
            'Color Filter Array (CFA) Bayer Mosaic: Physical cameras interpolate pixels through a Bayer RGGB sensor mosaic, creating subtle micro-correlations. Pure AI generated RGB pixels lack this sensor trace.',
        ],
        formula: 'S_{math} = 0.4 \\cdot [FFT_{score} > \\theta_{fft}] + 0.3 \\cdot [DCT_{score} > \\theta_{dct}] + 0.3 \\cdot [CFA_{absence} > \\theta_{cfa}]',
    },
    {
        num: '04',
        title: 'AI Neural Artifact Detector & Spatial Statistics',
        icon: <Cpu className="h-5 w-5 text-purple-600" />,
        badge: 'Weight: 25%',
        summary:
            'Employs deep vision transformer models alongside statistical entropy and blur gradient heuristics to detect generative artifacts.',
        technicalDetails: [
            'Pretrained deep neural image classifier (Hugging Face / Vision Transformer) trained on multi-generator synthetic benchmarks.',
            'Deterministic fallback heuristic calculates spatial Laplacian variance (blur consistency), Shannon entropy across color channels, and chromatic histogram dispersion.',
            'Flagged when neural prediction confidence exceeds calibrated threshold \\(\\theta = 0.75\\).',
        ],
        formula: 'S_{neural} = P(\\mathrm{Class} = \\mathrm{Synthetic} \\mid \\mathbf{x}_{img})',
    },
    {
        num: '05',
        title: 'Physics & Lighting Consistency (Quadrant Vectors & Glint)',
        icon: <Compass className="h-5 w-5 text-amber-600" />,
        badge: 'Weight: 5%',
        summary:
            'Compares illumination gradients across image quadrants and checks corneal specular reflection catchlight symmetry.',
        technicalDetails: [
            'Calculates dominant lighting gradient vectors across 4 image quadrants (Q1: Top-Left, Q2: Top-Right, Q3: Bottom-Left, Q4: Bottom-Right).',
            'Extracts eye specular highlights (corneal catchlights) to verify mirror symmetry relative to the primary light source.',
            'Spliced face swaps and diffusion composite subjects often exhibit physically impossible light directions between the face and background.',
        ],
        formula: '\\Delta\\theta_{glint} = |\\angle(\\mathbf{v}_{left}) - \\angle(\\mathbf{v}_{right})|',
    },
    {
        num: '06',
        title: 'Generator Signatures & Upsampling Artifacts',
        icon: <Fingerprint className="h-5 w-5 text-fuchsia-600" />,
        badge: 'Weight: 20%',
        summary:
            'Detects high-frequency spectral spikes caused by transposed convolution and checkerboard upsamplers in GANs and Diffusion models.',
        technicalDetails: [
            'Generative upsampling operations (such as ConvTranspose2d or pixel-shufflers) induce subtle periodic spatial frequencies.',
            'Calculates the radial energy spectrum profile and counts anomalous discrete spectral peaks that diverge from natural image power laws \\(1/f^\\alpha\\).',
        ],
        formula: 'S_{sig} = \\min\\left(1.0, \\frac{N_{peaks}}{\\kappa_{peaks}} + \\frac{\\mu_{high\\_freq}}{\\kappa_{freq}}\\right)',
    },
    {
        num: '07',
        title: 'Error Level Analysis (ELA) Compression Discrepancies',
        icon: <Waves className="h-5 w-5 text-sky-600" />,
        badge: 'Weight: 5%',
        summary:
            'Re-compresses the image at 95% JPEG quality to amplify and visualize local compression difference variances.',
        technicalDetails: [
            'Subtracts the re-compressed version from the original image and multiplies the delta by an enhancement scale factor.',
            'In an authentic, unedited photograph, all regions degrade at a uniform error level rate.',
            'Spliced or inserted generative elements display distinct glowing contours due to differing compression generations.',
        ],
        formula: '\\mathrm{ELA}(x, y) = |I_{orig}(x, y) - I_{recomp}(x, y)| \\times \\gamma',
    },
];

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            {/* Ambient Background */}
            <div className="bg-lab">
                <div className="lab-grid" />
                <div className="lab-glow-cyan" />
                <div className="lab-glow-violet" />
            </div>

            {/* Top Navigation */}
            <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4 text-sky-600" />
                        <span>Return to Forensic Studio</span>
                    </Link>

                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                            <BookOpen className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                            Forensic Science Knowledge Base
                        </span>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl px-4 sm:px-6 py-12 space-y-12">
                {/* Hero */}
                <section className="animate-fade-up border-b border-slate-200 pb-8">
                    <span className="micro-label !text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                        Technical Architecture & Mathematical Foundations
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">
                        How Veritas<span className="text-brand">·AI</span> Synthesizes Forensic Signals
                    </h1>
                    <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600">
                        Veritas AI executes a multi-layer pipeline combining classical mathematical signal processing, biological hemodynamics, optical physics, camera hardware forensics, and machine learning models. Instead of relying on a single brittle black-box model, each instrument evaluates a distinct physical or mathematical axiom.
                    </p>
                </section>

                {/* Architecture Flow Diagram */}
                <section className="panel p-6 sm:p-8 bg-white border-slate-200">
                    <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Layers className="h-4 w-4 text-sky-600" />
                        Dynamic Re-normalization Pipeline Architecture
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <span className="font-mono text-[10px] font-bold text-sky-700 uppercase">
                                STAGE 1
                            </span>
                            <h3 className="font-bold text-slate-900 mt-1">Evidence Ingestion</h3>
                            <p className="text-slate-500 mt-1">
                                Video frame decoding, EXIF header parsing, C2PA manifest extraction.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <span className="font-mono text-[10px] font-bold text-sky-700 uppercase">
                                STAGE 2
                            </span>
                            <h3 className="font-bold text-slate-900 mt-1">Parallel Extraction</h3>
                            <p className="text-slate-500 mt-1">
                                7 independent instruments compute scores or abstain if conditions unmet.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <span className="font-mono text-[10px] font-bold text-sky-700 uppercase">
                                STAGE 3
                            </span>
                            <h3 className="font-bold text-slate-900 mt-1">Weight Re-normalization</h3>
                            <p className="text-slate-500 mt-1">
                                Inactive layers abstain without voting 0.0 (preventing false authentic dilution).
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <span className="font-mono text-[10px] font-bold text-sky-700 uppercase">
                                STAGE 4
                            </span>
                            <h3 className="font-bold text-slate-900 mt-1">Dominant Signal Override</h3>
                            <p className="text-slate-500 mt-1">
                                Dominant anomalies (&gt;85%) elevate composite confidence for transparency.
                            </p>
                        </div>
                    </div>
                </section>

                {/* 7 Layer Deep Dive Cards */}
                <section className="space-y-6">
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                        Deep-Dive into the Seven Forensic Instruments
                    </h2>

                    <div className="space-y-5">
                        {LAYERS_DOC.map((layer) => (
                            <article
                                key={layer.num}
                                className="panel animate-fade-up p-6 sm:p-7 border-slate-200 bg-white shadow-2xs space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 shadow-2xs">
                                            {layer.icon}
                                        </div>
                                        <div>
                                            <span className="font-mono text-[10px] font-bold text-slate-400">
                                                INSTRUMENT {layer.num}
                                            </span>
                                            <h3 className="text-base font-bold text-slate-900">
                                                {layer.title}
                                            </h3>
                                        </div>
                                    </div>
                                    <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700 border border-slate-200 self-start sm:self-auto">
                                        {layer.badge}
                                    </span>
                                </div>

                                <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                                    {layer.summary}
                                </p>

                                <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                                    {layer.technicalDetails.map((detail, idx) => (
                                        <li key={idx} className="leading-relaxed">
                                            <span className="text-slate-800">{detail}</span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-700">
                                    <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">
                                        Mathematical Heuristic Formulation:
                                    </span>
                                    <code>{layer.formula}</code>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                {/* Compliance & Standards Footer */}
                <footer className="rounded-2xl border border-slate-200 bg-white p-6 text-xs text-slate-500 leading-relaxed shadow-2xs space-y-2">
                    <div className="flex items-center gap-2 text-slate-900 font-bold">
                        <ShieldCheck className="h-4 w-4 text-emerald-600" />
                        <span>ISO/IEC 27037 Digital Forensics Standards Draft</span>
                    </div>
                    <p>
                        Veritas AI is designed for transparent forensics intelligence, investigative journalism, and research verification. Findings represent deterministic signals and probability metrics that provide auditable trails for human analysts.
                    </p>
                </footer>
            </main>
        </div>
    );
}
