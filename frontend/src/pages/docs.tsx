import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers, Activity, Cpu, Zap, FileText } from 'lucide-react';

const Docs = () => {
    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100">
            <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                        <ArrowLeft className="w-5 h-5" /> Back to Dashboard
                    </Link>
                    <span className="font-semibold">Veritas AI Docs</span>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto px-6 py-12">
                <header className="mb-12">
                    <h1 className="text-4xl font-bold mb-4">How Veritas AI Works</h1>
                    <p className="text-xl text-gray-600">Understanding the Multi-Layer Forensics Pipeline</p>
                </header>

                <div className="space-y-12">
                    <Section
                        icon={<FileText className="w-6 h-6 text-blue-500" />}
                        title="Layer 1: Metadata & Provenance"
                        desc="Analyzes file headers, EXIF data, and C2PA manifests. AI-generated files often have missing metadata, inconsistent headers, or specific software signatures (e.g., 'Lavc58.54.100')."
                    />

                    <Section
                        icon={<Zap className="w-6 h-6 text-yellow-500" />}
                        title="Layer 2: Biological Signals (rPPG)"
                        desc="Extracts the photoplethysmographic (PPG) signal from facial skin. Real human faces exhibit subtle color changes (1.0-1.6 Hz) due to blood flow. Deepfakes often lack this biological pulse or show 'flatline' signals."
                    />

                    <Section
                        icon={<Activity className="w-6 h-6 text-purple-500" />}
                        title="Layer 3: Mathematical Forensics"
                        desc="Uses FFT (Fast Fourier Transform) and DCT (Discrete Cosine Transform) to find statistical anomalies. Generative models leave specific 'grid' patterns and spectral fingerprints that are invisible to the naked eye but obvious in the frequency domain."
                    />

                    <Section
                        icon={<Cpu className="w-6 h-6 text-red-500" />}
                        title="Layer 4: Hybrid AI Model"
                        desc="A dual-branch neural network. Branch A (CNN) looks for texture inconsistencies and noise artifacts. Branch B (Transformer) analyzes global semantic consistency (e.g., do the shadows match the light source?)."
                    />

                    <Section
                        icon={<Layers className="w-6 h-6 text-green-500" />}
                        title="Layer 5 & 6: Physics & Early Signatures"
                        desc="Checks for physical inconsistencies (lighting direction, eye reflections) and specific 'fingerprints' left by diffusion models (Stable Diffusion, Midjourney) or GANs."
                    />
                </div>
            </main>
        </div>
    );
};

const Section = ({ icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex gap-6">
        <div className="shrink-0 p-3 bg-gray-50 rounded-xl h-fit">{icon}</div>
        <div>
            <h2 className="text-2xl font-bold mb-3">{title}</h2>
            <p className="text-gray-600 leading-relaxed">{desc}</p>
        </div>
    </div>
);

export default Docs;
