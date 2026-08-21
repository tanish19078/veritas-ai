import { BadgeCheck, FileVideo, ImageIcon } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { toPercent } from '../../lib/format';
import { verdictTheme } from '../../lib/verdict';

const RADIUS = 56;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const ConfidenceGauge = ({ value, stroke }: { value: number; stroke: string }) => {
    const clamped = Math.max(0, Math.min(1, value));
    return (
        <div className="relative h-36 w-36 shrink-0">
            <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
                <circle
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke="rgba(148,163,184,0.12)"
                    strokeWidth="10"
                />
                <defs>
                    <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={stroke} />
                        <stop offset="100%" stopColor="#818cf8" />
                    </linearGradient>
                </defs>
                <circle
                    cx="70"
                    cy="70"
                    r={RADIUS}
                    fill="none"
                    stroke="url(#gaugeGradient)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={CIRCUMFERENCE * (1 - clamped)}
                    style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)' }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-mono text-2xl font-semibold text-slate-100">
                    {(clamped * 100).toFixed(0)}
                    <span className="text-sm text-slate-500">%</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500">
                    fake prob.
                </span>
            </div>
        </div>
    );
};

interface VerdictCardProps {
    result: AnalysisResult;
}

const VerdictCard = ({ result }: VerdictCardProps) => {
    const theme = verdictTheme(result.verdict);

    return (
        <section className={`panel animate-fade-up border ${theme.border} p-6 sm:p-8`}>
            <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-start">
                <ConfidenceGauge value={result.confidence} stroke={theme.stroke} />

                <div className="min-w-0 flex-1 text-center sm:text-left">
                    <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                        <span
                            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${theme.badgeBg} ${theme.border} ${theme.text}`}
                        >
                            <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                            {theme.label}
                        </span>
                        {result.media_type && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] px-3 py-1 text-xs text-slate-400">
                                {result.media_type === 'video' ? (
                                    <FileVideo className="h-3 w-3" />
                                ) : (
                                    <ImageIcon className="h-3 w-3" />
                                )}
                                {result.media_type}
                            </span>
                        )}
                        {result.is_verified && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                                <BadgeCheck className="h-3 w-3" /> C2PA
                            </span>
                        )}
                    </div>

                    <h2 className={`mt-4 text-3xl font-bold tracking-tight ${theme.text}`}>
                        {result.verdict}
                    </h2>
                    <p className="mt-1 font-mono text-xs text-slate-500">
                        {result.file_name ?? 'unknown file'} · confidence{' '}
                        {toPercent(result.confidence)}
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-slate-400">
                        {result.explanation}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default VerdictCard;
