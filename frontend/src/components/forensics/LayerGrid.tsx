import {
    Activity,
    Cpu,
    FileSearch,
    Fingerprint,
    Lightbulb,
    Ruler,
    Waves,
} from 'lucide-react';
import { AnalysisResult, LayerScores } from '../../types';
import { scoreColor } from '../../lib/verdict';

interface LayerMeta {
    key: keyof LayerScores;
    label: string;
    icon: React.ReactNode;
    blurb: string;
}

const LAYERS: LayerMeta[] = [
    { key: 'metadata', label: 'Metadata & Provenance', icon: <FileSearch className="h-4 w-4" />, blurb: 'EXIF · headers · C2PA' },
    { key: 'biology_rppg', label: 'Biological Signals', icon: <Activity className="h-4 w-4" />, blurb: 'CHROM rPPG pulse' },
    { key: 'math_forensics', label: 'Mathematical Forensics', icon: <Ruler className="h-4 w-4" />, blurb: 'FFT · DCT · CFA' },
    { key: 'ai_model', label: 'AI Artifact Detector', icon: <Cpu className="h-4 w-4" />, blurb: 'Learned artifacts' },
    { key: 'physics', label: 'Physics & Lighting', icon: <Lightbulb className="h-4 w-4" />, blurb: 'Gradients · eye glints' },
    { key: 'early_signature', label: 'Generator Signature', icon: <Fingerprint className="h-4 w-4" />, blurb: 'Spectral fingerprints' },
    { key: 'ela', label: 'Error Level Analysis', icon: <Waves className="h-4 w-4" />, blurb: 'Compression x-ray' },
];

const SEGMENTS = 24;

function detailLine(result: AnalysisResult, key: keyof LayerScores): string | null {
    const d = result.details;
    switch (key) {
        case 'metadata': {
            const count = (d.metadata?.exif_count as number | undefined) ?? null;
            return count === null ? null : `${count} EXIF tags recovered`;
        }
        case 'biology_rppg': {
            const band = d.biology?.pulse_band;
            if (band?.detected && band.estimated_bpm) return `cardiac peak ~${band.estimated_bpm} BPM`;
            if (d.biology?.note) return 'no face signal in media';
            return null;
        }
        case 'math_forensics': {
            const m = d.math as { fft_score?: number; dct_score?: number; cfa_absence_score?: number } | undefined;
            if (!m) return null;
            const parts: string[] = [];
            if (typeof m.fft_score === 'number') parts.push(`FFT ${(m.fft_score * 100).toFixed(0)}`);
            if (typeof m.dct_score === 'number') parts.push(`DCT ${(m.dct_score * 100).toFixed(0)}`);
            if (typeof m.cfa_absence_score === 'number') parts.push(`CFA ${(m.cfa_absence_score * 100).toFixed(0)}`);
            return parts.length ? parts.join(' · ') : null;
        }
        case 'ai_model': {
            const method = d.ai_model?.method as string | undefined;
            if (!method) return null;
            return method === 'pretrained' ? 'pretrained detector active' : 'heuristic statistics';
        }
        case 'physics': {
            const lighting = d.physics?.lighting?.score;
            const glint = d.physics?.eye_glint?.score;
            const parts: string[] = [];
            if (typeof lighting === 'number') parts.push(`light ${(lighting * 100).toFixed(0)}`);
            if (typeof glint === 'number') parts.push(`glint ${(glint * 100).toFixed(0)}`);
            return parts.length ? parts.join(' · ') : null;
        }
        case 'early_signature': {
            const peaks = d.early_signature?.fft_peaks;
            return typeof peaks === 'number' ? `${peaks} spectral peaks` : null;
        }
        case 'ela':
            return result.ela_url ? 'x-ray preview available' : null;
        default:
            return null;
    }
}

interface LayerGridProps {
    result: AnalysisResult;
}

const LayerGrid = ({ result }: LayerGridProps) => (
    <section className="panel animate-fade-up overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3.5">
            <h3 className="micro-label !text-slate-400">Layer Instrumentation</h3>
            <span className="micro-label">
                {Object.keys(result.layer_scores).length}/7 active
            </span>
        </div>

        <div className="divide-y divide-white/[0.05]">
            {LAYERS.map((layer, i) => {
                const raw = result.layer_scores[layer.key];
                const abstained = typeof raw !== 'number';
                const value = abstained ? 0 : raw;
                const litSegments = Math.round(value * SEGMENTS);

                return (
                    <div
                        key={layer.key}
                        className="animate-fade-up flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-white/[0.02]"
                        style={{ animationDelay: `${i * 55}ms` }}
                    >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.03] text-cyan-300">
                            {layer.icon}
                        </span>

                        <div className="w-40 shrink-0 sm:w-52">
                            <p className="truncate text-sm font-medium text-slate-200">
                                {layer.label}
                            </p>
                            <p className="truncate text-[11px] text-slate-500">
                                {abstained
                                    ? layer.blurb
                                    : detailLine(result, layer.key) ?? layer.blurb}
                            </p>
                        </div>

                        {/* segmented bar */}
                        <div className="hidden flex-1 items-center gap-[3px] sm:flex">
                            {Array.from({ length: SEGMENTS }, (_, s) => (
                                <span
                                    key={s}
                                    className={`h-3 flex-1 rounded-[2px] transition-colors duration-300 ${
                                        !abstained && s < litSegments ? scoreColor(value) : 'bg-white/[0.05]'
                                    }`}
                                    style={{ transitionDelay: `${s * 14}ms` }}
                                />
                            ))}
                        </div>
                        <div className="flex-1 sm:hidden">
                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                                {!abstained && (
                                    <div
                                        className={`h-full rounded-full ${scoreColor(value)}`}
                                        style={{ width: `${Math.max(value * 100, 2)}%` }}
                                    />
                                )}
                            </div>
                        </div>

                        <span className="w-16 shrink-0 text-right font-mono text-sm tabular-nums text-slate-300">
                            {abstained ? (
                                <span className="text-xs uppercase tracking-wider text-slate-600">
                                    abstain
                                </span>
                            ) : (
                                `${(value * 100).toFixed(1)}%`
                            )}
                        </span>
                    </div>
                );
            })}
        </div>
    </section>
);

export default LayerGrid;
