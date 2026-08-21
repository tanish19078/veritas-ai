import { Activity } from 'lucide-react';
import { AnalysisResult } from '../../types';

const WIDTH = 300;
const HEIGHT = 72;

const PulseWave = ({ result }: { result: AnalysisResult }) => {
    const waveform = result.details.biology?.waveform ?? [];
    const band = result.details.biology?.pulse_band;
    const detected = Boolean(band?.detected);
    const bpm = band?.estimated_bpm;

    if (waveform.length < 2) return null;

    const points = waveform
        .map((value, i) => {
            const x = (i / (waveform.length - 1)) * WIDTH;
            const y = HEIGHT - value * (HEIGHT - 8) - 4;
            return `${x.toFixed(2)},${y.toFixed(2)}`;
        })
        .join(' ');

    return (
        <section className="panel animate-fade-up p-5">
            <div className="mb-3 flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest text-slate-400">
                    <Activity className="h-4 w-4" /> Pulse Waveform
                </h3>
                {band && (
                    <span
                        className={`rounded-full border px-3 py-1 font-mono text-xs ${
                            detected
                                ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-300'
                                : 'border-white/[0.08] text-slate-500'
                        }`}
                    >
                        {detected && bpm ? `~${bpm} BPM` : 'no cardiac peak'}
                    </span>
                )}
            </div>
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="h-20 w-full"
            >
                <polyline
                    points={points}
                    fill="none"
                    stroke={detected ? '#34d399' : '#fbbf24'}
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    opacity="0.9"
                />
            </svg>
            <p className="mt-2 text-xs text-slate-500">
                CHROM signal filtered to the 0.7–4.0 Hz cardiac band across{' '}
                {result.details.biology?.face_frames ?? '?'} face frames.
            </p>
        </section>
    );
};

export default PulseWave;
