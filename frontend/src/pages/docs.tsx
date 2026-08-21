import React from 'react';
import Link from 'next/link';
import {
    Activity,
    ArrowLeft,
    Cpu,
    FileSearch,
    Fingerprint,
    Lightbulb,
    Ruler,
    ShieldCheck,
    Waves,
} from 'lucide-react';

const LAYERS = [
    {
        icon: <FileSearch className="h-5 w-5 text-cyan-300" />,
        title: 'Layer 1 · Metadata & Provenance',
        desc: 'Inspects file headers, EXIF richness and editing-software signatures, then verifies C2PA Content Credentials cryptographically when a manifest is present. Verified provenance overrides all metadata heuristics.',
    },
    {
        icon: <Activity className="h-5 w-5 text-emerald-300" />,
        title: 'Layer 2 · Biological Signals (CHROM rPPG)',
        desc: 'Extracts the blood-volume pulse from facial skin using chrominance-based rPPG. The signal is band-passed to the cardiac range (0.7–4.0 Hz) and scored for a dominant peak; deepfakes often show a flatline with no credible heart rate.',
    },
    {
        icon: <Ruler className="h-5 w-5 text-indigo-300" />,
        title: 'Layer 3 · Mathematical Forensics',
        desc: 'FFT spectral analysis, DCT blockiness measurement and Bayer/CFA sensor-trace detection. Camera sensors leave periodic noise correlations that fully synthetic RGB images never acquire.',
    },
    {
        icon: <Cpu className="h-5 w-5 text-rose-300" />,
        title: 'Layer 4 · AI Artifact Detector',
        desc: 'An optional pretrained Hugging Face detector scores learned generation artifacts; a deterministic blur/entropy/color heuristic provides an always-available fallback (the default inside Docker).',
    },
    {
        icon: <Lightbulb className="h-5 w-5 text-amber-300" />,
        title: 'Layer 5 · Physics & Lighting',
        desc: 'Compares the dominant illumination gradient across image quadrants and checks whether catchlights in paired eyes sit at mirror-symmetric positions — spliced faces rarely survive both tests.',
    },
    {
        icon: <Fingerprint className="h-5 w-5 text-fuchsia-300" />,
        title: 'Layer 6 · Generator Signatures',
        desc: 'Upsampling in GANs and diffusion models leaves periodic high-frequency energy visible as grid or star patterns in the magnitude spectrum. Peak concentration above calibrated thresholds flags it.',
    },
    {
        icon: <Waves className="h-5 w-5 text-sky-300" />,
        title: 'Layer 7 · Error Level Analysis',
        desc: 'Re-compresses the image and amplifies the difference. Regions that respond abnormally to JPEG re-saving — typical of splicing or heavy retouching — glow in the visualization.',
    },
];

const Docs = () => (
        <div className="min-h-screen">
            <div className="bg-lab">
                <div className="lab-grid" />
                <div className="lab-glow-cyan" />
                <div className="lab-glow-violet" />
            </div>
        <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-sm text-slate-400 transition-colors hover:text-slate-100"
                >
                    <ArrowLeft className="h-4 w-4" /> Back to Dashboard
                </Link>
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-200">
                    <ShieldCheck className="h-4 w-4 text-cyan-300" />
                    Veritas·AI Docs
                </span>
            </div>
        </nav>

        <main className="mx-auto max-w-4xl px-6 py-14">
            <header className="animate-fade-up mb-12">
                <p className="micro-label mb-3">System documentation</p>
                <h1 className="text-4xl font-bold tracking-tight text-slate-100">
                    How Veritas<span className="text-brand">·AI</span> works
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">
                    Seven independent forensic layers analyze each upload. Layers that cannot
                    judge the media abstain instead of voting, and the synthesizer re-normalizes
                    weights over the layers that spoke.
                </p>
            </header>

            <div className="space-y-4">
                {LAYERS.map((layer, i) => (
                    <section
                        key={layer.title}
                        className="panel panel-hover animate-fade-up flex gap-5 p-6"
                        style={{ animationDelay: `${i * 70}ms` }}
                    >
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
                            {layer.icon}
                        </div>
                        <div>
                            <h2 className="font-semibold text-slate-100">{layer.title}</h2>
                            <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                                {layer.desc}
                            </p>
                        </div>
                    </section>
                ))}
            </div>

            <footer className="mt-12 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 text-xs leading-relaxed text-slate-500">
                Veritas AI is a demonstration project. Its verdicts are probabilistic signals,
                not courtroom-grade forensic evidence — always combine them with human review.
            </footer>
        </main>
    </div>
);

export default Docs;
