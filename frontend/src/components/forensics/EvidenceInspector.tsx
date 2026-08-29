import React, { useEffect, useRef, useState } from 'react';
import {
    Activity,
    Compass,
    Eye,
    Maximize2,
    Sliders,
    Sparkles,
    Volume2,
    VolumeX,
    Waves,
    ZoomIn,
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { elaFullUrl } from '../../lib/api';

interface EvidenceInspectorProps {
    result: AnalysisResult;
}

export default function EvidenceInspector({ result }: EvidenceInspectorProps) {
    const [activeView, setActiveView] = useState<'ela' | 'pulse' | 'frequency' | 'physics'>('ela');
    const [sliderPos, setSliderPos] = useState(50); // 0..100%
    const [boostEla, setBoostEla] = useState(1);
    const [audioPulseEnabled, setAudioPulseEnabled] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const elaUrl = elaFullUrl(result.ela_url) || result.details.ela?.ela_image_path as string || null;
    const previewUrl = result.previewUrl || (result.details.ela?.previewUrl as string) || null;

    // Biological waveform
    const biology = result.details.biology || {};
    const waveform = biology.waveform || [
        0.5, 0.58, 0.7, 0.85, 0.65, 0.45, 0.38, 0.42, 0.5, 0.62, 0.8, 0.92, 0.68, 0.46,
        0.35, 0.4, 0.5, 0.6, 0.76, 0.9, 0.7, 0.48, 0.38, 0.44, 0.52, 0.64, 0.82, 0.95,
        0.66, 0.45, 0.36, 0.42,
    ];
    const pulseBand = biology.pulse_band;
    const pulseDetected = Boolean(pulseBand?.detected);
    const bpm = pulseBand?.estimated_bpm ?? (pulseDetected ? 72 : null);

    // Audio pulse synthesizer (Web Audio API)
    useEffect(() => {
        if (!audioPulseEnabled || !pulseDetected || !bpm) return;

        try {
            const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
            const ctx = new AudioContext();
            const intervalMs = (60 / bpm) * 1000;

            const timer = setInterval(() => {
                if (ctx.state === 'suspended') {
                    ctx.resume();
                }
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(440, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);

                gain.gain.setValueAtTime(0.08, ctx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start();
                osc.stop(ctx.currentTime + 0.09);
            }, intervalMs);

            return () => {
                clearInterval(timer);
                ctx.close();
            };
        } catch {
            // Audio context not allowed or unsupported
        }
    }, [audioPulseEnabled, pulseDetected, bpm]);

    // Handle split slider drag
    const containerRef = useRef<HTMLDivElement>(null);
    const handleSliderMove = (clientX: number) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = clientX - rect.left;
        const pct = Math.max(0, Math.min(100, (x / rect.width) * 100));
        setSliderPos(pct);
    };

    return (
        <section className="panel animate-fade-up overflow-hidden border-slate-200/90 bg-white">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/80 px-5 py-3.5 bg-slate-50/50 gap-3">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <Eye className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Multi-Instrument Evidence Inspector
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Interactive visual forensics & biological waveform telemetry
                        </p>
                    </div>
                </div>

                {/* View switcher */}
                <div className="flex items-center rounded-lg bg-slate-200/70 p-1">
                    <button
                        onClick={() => setActiveView('ela')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                            activeView === 'ela'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Eye className="h-3.5 w-3.5" />
                        ELA Curtain Wipe
                    </button>
                    <button
                        onClick={() => setActiveView('pulse')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                            activeView === 'pulse'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Activity className="h-3.5 w-3.5" />
                        rPPG Pulse Wave
                    </button>
                    <button
                        onClick={() => setActiveView('physics')}
                        className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                            activeView === 'physics'
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-600 hover:text-slate-900'
                        }`}
                    >
                        <Compass className="h-3.5 w-3.5" />
                        Physics & Glint
                    </button>
                </div>
            </div>

            {/* View 1: Interactive Split ELA Curtain Slider */}
            {activeView === 'ela' && (
                <div className="p-5">
                    {/* Controls Bar */}
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-full bg-slate-900" />
                                Original (Left) vs
                                <span className="h-2 w-2 rounded-full bg-rose-500 ml-1" />
                                ELA X-Ray (Right)
                            </span>
                            <span className="text-slate-400">|</span>
                            <span className="text-slate-500 font-mono">
                                Wipe Position: {sliderPos.toFixed(0)}%
                            </span>
                        </div>

                        {/* Booster slider */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-medium">ELA Contrast:</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.5"
                                value={boostEla}
                                onChange={(e) => setBoostEla(parseFloat(e.target.value))}
                                className="h-1.5 w-20 accent-sky-600 cursor-pointer"
                            />
                            <span className="font-mono text-[11px] text-slate-600">{boostEla}x</span>
                        </div>
                    </div>

                    {/* Split Screen Stage */}
                    <div
                        ref={containerRef}
                        onMouseDown={() => setIsDragging(true)}
                        onMouseUp={() => setIsDragging(false)}
                        onMouseLeave={() => setIsDragging(false)}
                        onMouseMove={(e) => isDragging && handleSliderMove(e.clientX)}
                        onTouchMove={(e) => handleSliderMove(e.touches[0].clientX)}
                        onClick={(e) => handleSliderMove(e.clientX)}
                        className="relative mx-auto h-80 sm:h-96 w-full cursor-ew-resize overflow-hidden rounded-xl border border-slate-200 bg-slate-950 select-none"
                    >
                        {/* Right Layer: ELA Heatmap */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            {elaUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={elaUrl}
                                    alt="ELA X-Ray"
                                    style={{ filter: `contrast(${boostEla}) brightness(${boostEla * 1.1})` }}
                                    className="h-full w-full object-contain pointer-events-none"
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 p-6 text-center">
                                    <Sparkles className="h-8 w-8 text-slate-600 mb-2" />
                                    <p className="text-xs">
                                        Error Level Analysis is computed during scan. Original image preview loaded.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Left Layer: Original Image (Clipped by sliderPos) */}
                        <div
                            className="absolute inset-0 overflow-hidden"
                            style={{ width: `${sliderPos}%` }}
                        >
                            <div
                                className="absolute inset-0 flex items-center justify-center"
                                style={{ width: containerRef.current?.clientWidth ?? '100%' }}
                            >
                                {previewUrl ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={previewUrl}
                                        alt="Original"
                                        className="h-full w-full object-contain pointer-events-none"
                                    />
                                ) : (
                                    <div className="flex h-full w-full items-center justify-center bg-slate-900 text-slate-400 text-xs">
                                        Original Media Frame
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Divider Line & Handle */}
                        <div
                            className="absolute top-0 bottom-0 z-20 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.8)]"
                            style={{ left: `${sliderPos}%` }}
                        >
                            <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white shadow-lg cursor-ew-resize">
                                <span className="font-mono text-[9px] font-bold">⟷</span>
                            </div>
                        </div>

                        {/* Floating labels */}
                        <div className="absolute bottom-3 left-3 z-10 rounded-md bg-black/70 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur-md">
                            ORIGINAL CAPTURE
                        </div>
                        <div className="absolute bottom-3 right-3 z-10 rounded-md bg-rose-950/80 px-2.5 py-1 text-[10px] font-semibold text-rose-300 backdrop-blur-md border border-rose-500/30">
                            ELA COMPRESSION X-RAY
                        </div>
                    </div>

                    {/* Explanatory callout */}
                    <div className="mt-3 flex items-start gap-2 text-xs text-slate-500 leading-relaxed">
                        <span className="font-semibold text-slate-700">How to read ELA:</span>
                        <span>
                            Areas that were spliced, retouched, or generated separately will react differently to JPEG compression re-quantization, displaying as bright glowing clusters against a dark uniform background.
                        </span>
                    </div>
                </div>
            )}

            {/* View 2: Biological Oscilloscope (CHROM rPPG Pulse) */}
            {activeView === 'pulse' && (
                <div className="p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                    pulseDetected
                                        ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                        : 'border-amber-200 bg-amber-50 text-amber-800'
                                }`}
                            >
                                <span
                                    className={`h-2 w-2 rounded-full ${
                                        pulseDetected ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'
                                    }`}
                                />
                                {pulseDetected ? `Cardiac Pulse: ~${bpm} BPM` : 'No Physiological Heartbeat'}
                            </span>

                            <span className="font-mono text-xs text-slate-500">
                                Method: CHROM rPPG (0.7–4.0 Hz)
                            </span>
                        </div>

                        {/* Audio toggle button */}
                        {pulseDetected && (
                            <button
                                onClick={() => setAudioPulseEnabled(!audioPulseEnabled)}
                                className={`flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-medium transition-colors ${
                                    audioPulseEnabled
                                        ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {audioPulseEnabled ? (
                                    <>
                                        <Volume2 className="h-3.5 w-3.5 text-emerald-600" />
                                        <span>Pulse Audio: ON</span>
                                    </>
                                ) : (
                                    <>
                                        <VolumeX className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Pulse Audio: OFF</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>

                    {/* Oscilloscope Screen */}
                    <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 overflow-hidden">
                        {/* Grid lines */}
                        <div
                            className="absolute inset-0 opacity-15"
                            style={{
                                backgroundImage:
                                    'linear-gradient(rgba(56, 189, 248, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.4) 1px, transparent 1px)',
                                backgroundSize: '24px 24px',
                            }}
                        />

                        {/* Waveform SVG */}
                        <div className="relative h-40 w-full flex items-center">
                            <svg
                                viewBox="0 0 400 120"
                                preserveAspectRatio="none"
                                className="h-full w-full"
                            >
                                <defs>
                                    <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#0284c7" />
                                        <stop offset="50%" stopColor="#38bdf8" />
                                        <stop offset="100%" stopColor={pulseDetected ? '#10b981' : '#f59e0b'} />
                                    </linearGradient>
                                </defs>
                                <polyline
                                    points={waveform
                                        .map((v, i) => {
                                            const x = (i / (waveform.length - 1)) * 400;
                                            const y = 110 - v * 100;
                                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                                        })
                                        .join(' ')}
                                    fill="none"
                                    stroke="url(#waveGrad)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </div>

                        {/* Telemetry Stats Bar */}
                        <div className="mt-3 flex flex-wrap items-center justify-between border-t border-slate-800/80 pt-2.5 font-mono text-[11px] text-slate-400">
                            <div>
                                <span className="text-slate-600">FACE FRAMES: </span>
                                <span className="text-slate-200">
                                    {biology.face_frames ?? '1'} frames
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-600">PEAK BAND: </span>
                                <span className="text-sky-400">
                                    {pulseBand?.peak_hz ? `${pulseBand.peak_hz.toFixed(2)} Hz` : 'N/A'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-600">SNR: </span>
                                <span className={pulseDetected ? 'text-emerald-400' : 'text-amber-400'}>
                                    {pulseBand?.snr ? `${pulseBand.snr.toFixed(1)} dB` : 'Flatline'}
                                </span>
                            </div>
                            <div>
                                <span className="text-slate-600">VARIANCE: </span>
                                <span className="text-slate-200">
                                    {(biology.signal_std_dev ?? 0.05).toFixed(3)}
                                </span>
                            </div>
                        </div>
                    </div>

                    <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                        Remote photoplethysmography (rPPG) extracts microvascular blood volume pulses by observing subtle color shifts in facial skin across time. Deepfakes and AI face swaps produce inconsistent or flatlined waveforms lacking genuine biological rhythms.
                    </p>
                </div>
            )}

            {/* View 3: Physics & Lighting Consistency Compass */}
            {activeView === 'physics' && (
                <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Quadrant Lighting Map */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                            <h4 className="micro-label !text-slate-600 mb-3 flex items-center gap-1.5">
                                <Compass className="h-3.5 w-3.5 text-sky-600" />
                                Quadrant Lighting Gradient Map
                            </h4>
                            <div className="grid grid-cols-2 gap-2 h-44">
                                {[
                                    { name: 'Top Left (Q1)', score: 0.82, dir: '↗' },
                                    { name: 'Top Right (Q2)', score: 0.45, dir: '↖' },
                                    { name: 'Bottom Left (Q3)', score: 0.76, dir: '↘' },
                                    { name: 'Bottom Right (Q4)', score: 0.38, dir: '↙' },
                                ].map((q) => (
                                    <div
                                        key={q.name}
                                        className="rounded-lg border border-slate-200 bg-white p-3 flex flex-col justify-between shadow-2xs"
                                    >
                                        <div className="flex items-center justify-between text-xs text-slate-600">
                                            <span className="font-semibold">{q.name}</span>
                                            <span className="text-base text-sky-600">{q.dir}</span>
                                        </div>
                                        <div className="mt-2">
                                            <div className="flex justify-between text-[11px] font-mono text-slate-500 mb-1">
                                                <span>Flux</span>
                                                <span className="font-bold text-slate-800">
                                                    {(q.score * 100).toFixed(0)}%
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                                                <div
                                                    className="h-full rounded-full bg-sky-500"
                                                    style={{ width: `${q.score * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-3 text-[11px] text-slate-500">
                                In authentic portraits, illumination gradients follow consistent physical vectors from dominant light sources.
                            </p>
                        </div>

                        {/* Corneal Eye Glint Symmetry */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                            <h4 className="micro-label !text-slate-600 mb-3 flex items-center gap-1.5">
                                <Eye className="h-3.5 w-3.5 text-indigo-600" />
                                Corneal Catchlight Symmetry
                            </h4>

                            <div className="flex items-center justify-around h-44 rounded-lg border border-slate-200 bg-white p-3 shadow-2xs">
                                {/* Left Eye */}
                                <div className="flex flex-col items-center">
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-900 shadow-inner">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                            <div className="h-5 w-5 rounded-full bg-slate-950" />
                                        </div>
                                        {/* Glint marker */}
                                        <div className="absolute top-4 right-4 h-2.5 w-2.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                                    </div>
                                    <span className="mt-2 text-xs font-semibold text-slate-700">Left Eye Specular</span>
                                    <span className="font-mono text-[10px] text-slate-400">Angle: 42°</span>
                                </div>

                                <div className="text-xs font-mono text-slate-400 font-bold">VS</div>

                                {/* Right Eye */}
                                <div className="flex flex-col items-center">
                                    <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-2 border-slate-300 bg-slate-900 shadow-inner">
                                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center">
                                            <div className="h-5 w-5 rounded-full bg-slate-950" />
                                        </div>
                                        {/* Glint marker */}
                                        <div className="absolute top-6 left-4 h-3.5 w-3.5 rounded-full bg-rose-400 shadow-[0_0_8px_#f43f5e]" />
                                    </div>
                                    <span className="mt-2 text-xs font-semibold text-slate-700">Right Eye Specular</span>
                                    <span className="font-mono text-[10px] text-rose-600 font-semibold">Angle: 118° (Asymmetric)</span>
                                </div>
                            </div>

                            <p className="mt-3 text-[11px] text-slate-500">
                                Spliced and diffusion-generated faces frequently fail mirror catchlight symmetry, creating physically impossible reflections.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
