import React, { useState } from 'react';
import {
    Activity,
    AlertCircle,
    Check,
    Gauge,
    RefreshCw,
    RotateCcw,
    Shield,
    Sliders,
    Sparkles,
} from 'lucide-react';
import { AnalysisResult, LayerScores } from '../../types';
import { toPercent } from '../../lib/format';
import { getThreatAssessment, verdictTheme } from '../../lib/verdict';

interface CalibrationSandboxProps {
    result: AnalysisResult | null;
}

const DEFAULT_WEIGHTS = {
    metadata: 0.1,
    biology_rppg: 0.1,
    math_forensics: 0.25,
    ai_model: 0.25,
    physics: 0.05,
    early_signature: 0.2,
    ela: 0.05,
};

export default function CalibrationSandbox({ result }: CalibrationSandboxProps) {
    const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
    const [fftThresh, setFftThresh] = useState(0.7);
    const [dctThresh, setDctThresh] = useState(0.6);
    const [cfaThresh, setCfaThresh] = useState(0.8);
    const [l6Divisor, setL6Divisor] = useState(200);

    const scores = result?.layer_scores || {
        metadata: 0.4,
        biology_rppg: 0.8,
        math_forensics: 0.85,
        ai_model: 0.9,
        physics: 0.7,
        early_signature: 0.88,
        ela: 0.75,
    };

    // Calculate dynamically re-weighted score
    let totalScore = 0;
    let totalWeight = 0;
    for (const [key, wt] of Object.entries(weights)) {
        const s = scores[key as keyof LayerScores];
        if (typeof s === 'number') {
            totalScore += s * wt;
            totalWeight += wt;
        }
    }

    const reweightedConfidence = totalWeight > 0 ? totalScore / totalWeight : 0;
    const reweightedVerdict =
        reweightedConfidence > 0.75
            ? 'AI-Generated'
            : reweightedConfidence > 0.4
            ? 'Suspicious / Inconclusive'
            : 'Authentic';

    const theme = verdictTheme(reweightedVerdict);
    const threat = getThreatAssessment(reweightedConfidence);

    const resetDefaults = () => {
        setWeights(DEFAULT_WEIGHTS);
        setFftThresh(0.7);
        setDctThresh(0.6);
        setCfaThresh(0.8);
        setL6Divisor(200);
    };

    return (
        <section className="panel animate-fade-up border-slate-200/90 bg-white p-6 sm:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-5 gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
                        <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900">
                            Forensic Calibration Sandbox
                        </h2>
                        <p className="text-xs text-slate-500">
                            Tune instrument weights and anomaly detection thresholds to simulate policy sensitivity
                        </p>
                    </div>
                </div>

                <button
                    onClick={resetDefaults}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Reset Factory Defaults
                </button>
            </div>

            {/* Live Verdict Simulator Card */}
            <div
                className={`rounded-2xl border p-5 ${theme.badgeBg} ${theme.border} transition-all`}
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="font-mono text-[10px] uppercase font-bold tracking-widest text-slate-500">
                            SIMULATED POLICY OUTPUT
                        </span>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`h-3 w-3 rounded-full ${theme.dot}`} />
                            <h3 className={`text-2xl font-extrabold ${theme.text}`}>
                                {reweightedVerdict}
                            </h3>
                            <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold border ${threat.color}`}
                            >
                                {threat.rating}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 bg-white/80 rounded-xl p-3 border border-slate-200/80">
                        <div className="text-right">
                            <span className="micro-label">Simulated Confidence</span>
                            <div className="font-mono text-2xl font-black text-slate-900">
                                {toPercent(reweightedConfidence)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weight Sliders Matrix */}
            <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
                    INSTRUMENT CONTRIBUTION WEIGHTS
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                        { key: 'math_forensics', label: 'Layer 3: Math (FFT/DCT/CFA)', default: '25%' },
                        { key: 'ai_model', label: 'Layer 4: Neural Artifacts', default: '25%' },
                        { key: 'early_signature', label: 'Layer 6: Generator Signatures', default: '20%' },
                        { key: 'metadata', label: 'Layer 1: Metadata & Provenance', default: '10%' },
                        { key: 'biology_rppg', label: 'Layer 2: Biological Signals', default: '10%' },
                        { key: 'physics', label: 'Layer 5: Physics & Lighting', default: '5%' },
                        { key: 'ela', label: 'Layer 7: Error Level Analysis', default: '5%' },
                    ].map((item) => {
                        const currentWeight = weights[item.key as keyof typeof weights];
                        return (
                            <div
                                key={item.key}
                                className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5 shadow-2xs"
                            >
                                <div className="flex justify-between items-center text-xs mb-1.5">
                                    <span className="font-semibold text-slate-800">{item.label}</span>
                                    <span className="font-mono font-bold text-sky-700">
                                        {(currentWeight * 100).toFixed(0)}%
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="0.5"
                                    step="0.05"
                                    value={currentWeight}
                                    onChange={(e) =>
                                        setWeights((prev) => ({
                                            ...prev,
                                            [item.key]: parseFloat(e.target.value),
                                        }))
                                    }
                                    className="w-full accent-sky-600 cursor-pointer"
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Anomaly Threshold Sliders */}
            <div className="border-t border-slate-200 pt-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-mono mb-3">
                    CORE ANOMALY THRESHOLDS (BACKEND TUNING)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                        <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>L3 FFT Grid Threshold</span>
                            <span className="font-mono text-sky-700">{fftThresh}</span>
                        </div>
                        <input
                            type="range"
                            min="0.3"
                            max="0.95"
                            step="0.05"
                            value={fftThresh}
                            onChange={(e) => setFftThresh(parseFloat(e.target.value))}
                            className="w-full accent-sky-600 cursor-pointer"
                        />
                        <p className="mt-1 font-mono text-[10px] text-slate-500">Default: 0.70</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                        <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>L3 DCT Residue Threshold</span>
                            <span className="font-mono text-sky-700">{dctThresh}</span>
                        </div>
                        <input
                            type="range"
                            min="0.3"
                            max="0.95"
                            step="0.05"
                            value={dctThresh}
                            onChange={(e) => setDctThresh(parseFloat(e.target.value))}
                            className="w-full accent-sky-600 cursor-pointer"
                        />
                        <p className="mt-1 font-mono text-[10px] text-slate-500">Default: 0.60</p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
                        <div className="flex justify-between font-semibold text-slate-800 mb-1">
                            <span>L6 Peak Sensitivity Divisor</span>
                            <span className="font-mono text-sky-700">{l6Divisor}</span>
                        </div>
                        <input
                            type="range"
                            min="50"
                            max="400"
                            step="25"
                            value={l6Divisor}
                            onChange={(e) => setL6Divisor(parseInt(e.target.value, 10))}
                            className="w-full accent-sky-600 cursor-pointer"
                        />
                        <p className="mt-1 font-mono text-[10px] text-slate-500">Default: 200</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
