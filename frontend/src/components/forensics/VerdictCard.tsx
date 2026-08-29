import React, { useState } from 'react';
import {
    AlertTriangle,
    BadgeCheck,
    CheckCircle2,
    Copy,
    Download,
    FileCode,
    FileSpreadsheet,
    FileText,
    FileVideo,
    ImageIcon,
    Layers,
    Share2,
    ShieldAlert,
    Sparkles,
} from 'lucide-react';
import { AnalysisResult } from '../../types';
import { toPercent } from '../../lib/format';
import { getThreatAssessment, verdictTheme } from '../../lib/verdict';
import ArcGauge from './ArcGauge';

interface VerdictCardProps {
    result: AnalysisResult;
    onOpenDossier?: () => void;
    onExportCsv?: () => void;
}

export default function VerdictCard({ result, onOpenDossier, onExportCsv }: VerdictCardProps) {
    const theme = verdictTheme(result.verdict);
    const threat = getThreatAssessment(result.confidence ?? 0);
    const [copied, setCopied] = useState(false);

    const activeLayersCount = Object.keys(result.layer_scores || {}).length;

    const copySummary = () => {
        const text = `VERITAS AI FORENSIC AUDIT\nSubject: ${result.file_name || 'Evidence'}\nVerdict: ${result.verdict}\nConfidence: ${toPercent(result.confidence)}\nThreat Rating: ${threat.rating}\nC2PA Verified: ${result.is_verified ? 'Yes' : 'No'}\n\nFindings: ${result.explanation}`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section
            className={`panel animate-fade-up relative overflow-hidden p-6 sm:p-8 border ${theme.border} ${theme.cardBg}`}
        >
            {/* Ambient Background Aura */}
            <div
                className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full blur-3xl opacity-40"
                style={{ background: theme.stroke }}
            />

            <div className="relative flex flex-col items-center gap-8 lg:flex-row lg:items-center">
                {/* Arc Gauge Visualizer */}
                <div className="flex flex-col items-center">
                    <ArcGauge value={result.confidence} stroke={theme.stroke} />
                    <span className="mt-2 font-mono text-[11px] text-slate-500 font-medium">
                        Model Confidence: {toPercent(result.confidence)}
                    </span>
                </div>

                {/* Verdict & Threat Details */}
                <div className="min-w-0 flex-1 text-center lg:text-left">
                    {/* Badges row */}
                    <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
                        {/* Verdict badge */}
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm ${theme.badgeBg}`}
                        >
                            <span className={`h-2 w-2 rounded-full ${theme.dot}`} />
                            {theme.label}
                        </span>

                        {/* Threat Level */}
                        <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${threat.color}`}
                        >
                            <AlertTriangle className="h-3 w-3" />
                            {threat.rating}
                        </span>

                        {/* Media type */}
                        {result.media_type && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                                {result.media_type === 'video' ? (
                                    <FileVideo className="h-3.5 w-3.5 text-indigo-500" />
                                ) : (
                                    <ImageIcon className="h-3.5 w-3.5 text-sky-500" />
                                )}
                                <span className="capitalize">{result.media_type}</span>
                            </span>
                        )}

                        {/* C2PA Provenance badge */}
                        {result.is_verified && (
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">
                                <BadgeCheck className="h-3.5 w-3.5 text-sky-600" />
                                C2PA Certified
                            </span>
                        )}

                        {/* Active layers badge */}
                        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 px-2.5 py-1 text-xs font-medium text-slate-600">
                            <Layers className="h-3 w-3 text-slate-400" />
                            {activeLayersCount}/7 Instruments Active
                        </span>
                    </div>

                    {/* Main Headline */}
                    <h2 className={`mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight ${theme.text}`}>
                        {result.verdict}
                    </h2>

                    {/* Metadata summary grid */}
                    <div className="mt-4 grid grid-cols-1 gap-3 rounded-xl border border-slate-200/80 bg-white/80 p-3.5 text-left sm:grid-cols-3">
                        <div>
                            <span className="micro-label">Analyzed Subject</span>
                            <p
                                className="mt-0.5 truncate font-mono text-xs font-semibold text-slate-800"
                                title={result.file_name ?? 'unknown file'}
                            >
                                {result.file_name ?? 'Uploaded Asset'}
                            </p>
                        </div>
                        <div>
                            <span className="micro-label">Threat Assessment</span>
                            <p className="mt-0.5 font-mono text-xs font-semibold text-slate-800">
                                {threat.rating}
                            </p>
                        </div>
                        <div>
                            <span className="micro-label">Cryptographic Provenance</span>
                            <p className="mt-0.5 font-mono text-xs font-semibold text-slate-800">
                                {result.is_verified ? 'C2PA Manifest Valid' : 'Standard Unsigned'}
                            </p>
                        </div>
                    </div>

                    {/* Explanatory Findings */}
                    <div className="mt-3.5 rounded-xl border-l-4 border-slate-400 bg-slate-50/80 p-3 text-left">
                        <p className="text-xs leading-relaxed text-slate-700">
                            <strong className="font-semibold text-slate-900">Key Finding: </strong>
                            {result.explanation}
                        </p>
                    </div>

                    {/* Quick action buttons */}
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5 lg:justify-start">
                        {onOpenDossier && (
                            <button
                                onClick={onOpenDossier}
                                className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-slate-800 hover:shadow"
                            >
                                <FileText className="h-3.5 w-3.5 text-sky-400" />
                                Official Forensic Dossier
                            </button>
                        )}
                        {onExportCsv && (
                            <button
                                onClick={onExportCsv}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
                                Export CSV
                            </button>
                        )}
                        <button
                            onClick={copySummary}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
                        >
                            {copied ? (
                                <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                                    <span>Copied!</span>
                                </>
                            ) : (
                                <>
                                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Copy Summary</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
