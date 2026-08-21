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
    { key: 'metadata', label: 'Metadata', icon: <FileSearch className="h-4 w-4" />, blurb: 'EXIF · headers · C2PA' },
    { key: 'biology_rppg', label: 'Biology', icon: <Activity className="h-4 w-4" />, blurb: 'CHROM rPPG pulse' },
    { key: 'math_forensics', label: 'Math', icon: <Ruler className="h-4 w-4" />, blurb: 'FFT · DCT · CFA' },
    { key: 'ai_model', label: 'AI Model', icon: <Cpu className="h-4 w-4" />, blurb: 'Learned artifacts' },
    { key: 'physics', label: 'Physics', icon: <Lightbulb className="h-4 w-4" />, blurb: 'Lighting · eye glints' },
    { key: 'early_signature', label: 'Signature', icon: <Fingerprint className="h-4 w-4" />, blurb: 'Generator fingerprints' },
    { key: 'ela', label: 'ELA', icon: <Waves className="h-4 w-4" />, blurb: 'Compression x-ray' },
];

function detailLine(result: AnalysisResult, key: keyof LayerScores): string | null {
    const d = result.details;
    switch (key) {
        case 'metadata': {
            const count = (d.metadata?.exif_count as number | undefined) ?? null;
            return count === null ? null : `${count} EXIF tags`;
        }
        case 'biology_rppg': {
            const band = d.biology?.pulse_band;
            if (band?.detected && band.estimated_bpm) return `~${band.estimated_bpm} BPM`;
            if (d.biology?.note) return 'no face signal';
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
            return method === 'pretrained' ? 'pretrained detector' : 'heuristic stats';
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
            return result.ela_url ? 'preview available' : null;
        default:
            return null;
    }
}

interface LayerGridProps {
    result: AnalysisResult;
}

const LayerGrid = ({ result }: LayerGridProps) => (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {LAYERS.map((layer, i) => {
            const raw = result.layer_scores[layer.key];
            const abstained = typeof raw !== 'number';
            const value = abstained ? 0 : raw;

            return (
                <div
                    key={layer.key}
                    className="panel panel-hover animate-fade-up p-4"
                    style={{ animationDelay: `${i * 60}ms` }}
                >
                    <div className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                            <span className="text-cyan-300">{layer.icon}</span>
                            {layer.label}
                        </span>
                        {abstained ? (
                            <span className="rounded-full border border-white/[0.08] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500">
                                abstained
                            </span>
                        ) : (
                            <span className="font-mono text-sm text-slate-300">
                                {(value * 100).toFixed(1)}%
                            </span>
                        )}
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        {!abstained && (
                            <div
                                className={`h-full rounded-full ${scoreColor(value)} transition-all duration-700`}
                                style={{ width: `${Math.max(value * 100, 2)}%` }}
                            />
                        )}
                    </div>

                    <p className="mt-2.5 truncate text-xs text-slate-500">
                        {abstained ? layer.blurb : detailLine(result, layer.key) ?? layer.blurb}
                    </p>
                </div>
            );
        })}
    </section>
);

export default LayerGrid;
