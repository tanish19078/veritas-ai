import { BadgeCheck, FileVideo, ImageIcon } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { toPercent } from '../../lib/format';
import { verdictTheme } from '../../lib/verdict';
import ArcGauge from './ArcGauge';

interface VerdictCardProps {
    result: AnalysisResult;
}

const VerdictCard = ({ result }: VerdictCardProps) => {
    const theme = verdictTheme(result.verdict);

    return (
        <section className="panel animate-fade-up relative overflow-hidden p-6 sm:p-8">
            {/* verdict-tinted ambient glow */}
            <div
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full opacity-[0.12] blur-3xl"
                style={{ background: theme.stroke }}
            />

            <div className="relative flex flex-col items-center gap-8 sm:flex-row sm:items-center">
                <ArcGauge value={result.confidence} stroke={theme.stroke} />

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

                    <h2 className={`mt-4 text-4xl font-bold tracking-tight ${theme.text}`}>
                        {result.verdict}
                    </h2>

                    <dl className="mt-5 grid grid-cols-1 gap-x-6 gap-y-2 text-left sm:grid-cols-2">
                        <div>
                            <dt className="micro-label">Subject</dt>
                            <dd className="mt-0.5 truncate font-mono text-xs text-slate-300">
                                {result.file_name ?? 'unknown file'}
                            </dd>
                        </div>
                        <div>
                            <dt className="micro-label">Confidence</dt>
                            <dd className="mt-0.5 font-mono text-xs text-slate-300">
                                {toPercent(result.confidence)} fake probability
                            </dd>
                        </div>
                    </dl>

                    <p className="mt-4 border-l-2 border-white/[0.08] pl-3 text-sm leading-relaxed text-slate-400">
                        {result.explanation}
                    </p>
                </div>
            </div>
        </section>
    );
};

export default VerdictCard;
