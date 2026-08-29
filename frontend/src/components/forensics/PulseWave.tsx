import React from 'react';
import { Activity } from 'lucide-react';
import { AnalysisResult } from '../../types';

const WIDTH = 320;
const HEIGHT = 80;

export default function PulseWave({ result }: { result: AnalysisResult }) {
    const waveform = result.details.biology?.waveform ?? [];
    const band = result.details.biology?.pulse_band;
    const detected = Boolean(band?.detected);
    const bpm = band?.estimated_bpm;

    if (waveform.length < 2) return null;

    const points = waveform
        .map((value, i) => {
            const x = (i / (waveform.length - 1)) * WIDTH;
            const y = HEIGHT - value * (HEIGHT - 12) - 6;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <section className="panel animate-fade-up p-5 border-slate-200 bg-white">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="micro-label !text-slate-700 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-emerald-600" /> Pulse Waveform (CHROM rPPG)
                </h3>
                {band && (
                    <span
                        className={`rounded-full border px-2.5 py-0.5 font-mono text-xs font-semibold ${
                            detected
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-amber-200 bg-amber-50 text-amber-800'
                        }`}
                    >
                        {detected && bpm ? `~${bpm} BPM` : 'No Cardiac Peak'}
                    </span>
                )}
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                <svg
                    viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                    preserveAspectRatio="none"
                    className="h-20 w-full"
                >
                    <polyline
                        points={points}
                        fill="none"
                        stroke={detected ? '#10b981' : '#f59e0b'}
                        strokeWidth="2"
                        strokeLinejoin="round"
                        strokeLinecap="round"
                    />
                </svg>
            </div>
            <p className="mt-2 text-xs text-slate-500">
                CHROM signal filtered to the 0.7–4.0 Hz cardiac band across{' '}
                {result.details.biology?.face_frames ?? '?'} face frames.
            </p>
        </section>
    );
}
