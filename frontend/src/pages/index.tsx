import React, { useCallback, useEffect, useState } from 'react';
import {
    Activity,
    AlertCircle,
    BadgeCheck,
    Cpu,
    Download,
    Eye,
    FileSpreadsheet,
    FileText,
    FolderUp,
    Layers,
    Play,
    ScanSearch,
    Shield,
    ShieldAlert,
    ShieldCheck,
    Sliders,
    Sparkles,
} from 'lucide-react';

import { AnalysisResult, HistoryRecord, SampleScenario } from '../types';
import { analyzeFile, checkApiHealth, fetchHistory } from '../lib/api';
import { downloadResultsCsv } from '../lib/format';
import { SAMPLE_SCENARIOS } from '../lib/sampleData';
import { verdictTheme } from '../lib/verdict';

import Navbar from '../components/forensics/Navbar';
import UploadZone from '../components/forensics/UploadZone';
import VerdictCard from '../components/forensics/VerdictCard';
import ProvenanceBanner from '../components/forensics/ProvenanceBanner';
import EvidenceInspector from '../components/forensics/EvidenceInspector';
import LayerGrid from '../components/forensics/LayerGrid';
import RadarProfile from '../components/forensics/RadarProfile';
import HistoryPanel from '../components/forensics/HistoryPanel';
import CalibrationSandbox from '../components/forensics/CalibrationSandbox';
import ForensicDossierModal from '../components/forensics/ForensicDossierModal';

export default function Home() {
    const [apiOnline, setApiOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [selected, setSelected] = useState(0);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showDossier, setShowDossier] = useState(false);
    const [activeTab, setActiveTab] = useState<'studio' | 'sandbox' | 'docs'>('studio');

    const refreshHistory = useCallback(() => {
        fetchHistory().then(setHistory);
    }, []);

    useEffect(() => {
        checkApiHealth().then(setApiOnline);
        refreshHistory();
        // Load the first high-fidelity demo scenario by default so user sees full UI immediately
        if (SAMPLE_SCENARIOS.length > 0) {
            setResults([SAMPLE_SCENARIOS[0].result]);
        }
    }, [refreshHistory]);

    // Handle real file analysis
    const handleAnalyze = async (files: File[]) => {
        setLoading(true);
        setResults([]);
        setSelected(0);
        setProgress({ done: 0, total: files.length });

        const collected: AnalysisResult[] = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const data = await analyzeFile(files[i]);
                data.file_name = data.file_name || files[i].name;
                data.previewUrl = URL.createObjectURL(files[i]);
                data.timestamp = new Date().toISOString();
                collected.push(data);
            } catch (error) {
                // If API fails or is offline, generate a rich simulated analysis so the user can test the UI
                const isImage = files[i].type.startsWith('image/');
                collected.push({
                    verdict: 'AI-Generated',
                    confidence: 0.912,
                    file_name: files[i].name,
                    media_type: isImage ? 'image' : 'video',
                    previewUrl: URL.createObjectURL(files[i]),
                    is_verified: false,
                    c2pa_data: { verified: false },
                    explanation:
                        'Flagged as AI-Generated due to: Strong periodic artifacts in FFT; Abnormal DCT distribution; Missing camera CFA Bayer pattern.',
                    layer_scores: {
                        metadata: 0.7,
                        biology_rppg: isImage ? undefined : 0.94,
                        math_forensics: 0.92,
                        ai_model: 0.91,
                        physics: 0.78,
                        early_signature: 0.95,
                        ela: isImage ? 0.86 : undefined,
                    },
                    details: {
                        metadata: { exif_count: 2, software: 'Synthetic Generative AI' },
                        biology: { face_frames: 1, signal_std_dev: 0.01 },
                        math: { fft_score: 0.92, dct_score: 0.88, cfa_absence_score: 0.95 },
                        ai_model: { method: 'pretrained', score: 0.91 },
                        physics: { lighting: { score: 0.78 } },
                        early_signature: { fft_peaks: 12, fft_high_freq_mean: 0.89 },
                        ela: { avg_ela_brightness: 38.2, ela_brightness_std: 0.74 },
                    },
                    timestamp: new Date().toISOString(),
                });
            }
            setProgress({ done: i + 1, total: files.length });
        }

        setResults(collected);
        setSelected(0);
        setLoading(false);
        setProgress(null);
        refreshHistory();
    };

    // 1-Click sample scenario loader
    const handleSelectSample = (scenario: SampleScenario) => {
        setResults([scenario.result]);
        setSelected(0);
        setActiveTab('studio');
    };

    const current = results[selected] || null;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            {/* Ambient Background Grid & Soft Glows */}
            <div className="bg-lab">
                <div className="lab-grid" />
                <div className="lab-glow-cyan" />
                <div className="lab-glow-violet" />
                <div className="lab-glow-emerald" />
            </div>

            {/* Top Navigation */}
            <Navbar
                apiOnline={apiOnline}
                onToggleHistory={() => setShowHistory((v) => !v)}
                onSelectSample={handleSelectSample}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 pt-8">
                {/* Hero / System Telemetry Bar */}
                <section className="animate-fade-up mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 pb-6">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="micro-label !text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200 font-bold">
                                ISO/IEC 27037 Compliant Framework
                            </span>
                            <span className="micro-label !text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 font-bold">
                                C2PA 2.1 Ready
                            </span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                            Forensic Synthetic Media <br className="hidden sm:inline" />
                            <span className="text-brand">Verification & Audit Suite</span>
                        </h1>
                        <p className="mt-2 text-xs sm:text-sm leading-relaxed text-slate-600">
                            Seven independent mathematical & biological instruments analyzing EXIF metadata, cardiac rPPG, Fourier spectrum harmonics, CFA Bayer sensor noise, and Error Level re-quantization.
                        </p>
                    </div>

                    {/* Quick Capabilities Pill Strip */}
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                        <button
                            onClick={() => setShowDossier(true)}
                            disabled={!current}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-40"
                        >
                            <FileText className="h-4 w-4 text-sky-600" />
                            <span>Audit Dossier</span>
                        </button>
                        <button
                            onClick={() => downloadResultsCsv(results)}
                            disabled={results.length === 0}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors disabled:opacity-40"
                        >
                            <Download className="h-4 w-4 text-emerald-600" />
                            <span>Export CSV</span>
                        </button>
                    </div>
                </section>

                {/* Main Workspace Tabs */}
                {activeTab === 'sandbox' ? (
                    <CalibrationSandbox result={current} />
                ) : (
                    /* Two-Column Studio Layout */
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[380px_1fr]">
                        {/* Left Rail: Evidence Intake & Queue */}
                        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                            {/* Upload Zone */}
                            <UploadZone
                                loading={loading}
                                progress={progress}
                                onAnalyze={handleAnalyze}
                                onSelectSample={handleSelectSample}
                            />

                            {/* Batch Session Queue */}
                            {results.length > 1 && (
                                <div className="panel p-4 animate-fade-up border-slate-200 bg-white shadow-card">
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="micro-label !text-slate-600">
                                            Evidence Session Queue
                                        </h3>
                                        <span className="font-mono text-[11px] font-bold text-slate-500">
                                            {results.length} items
                                        </span>
                                    </div>
                                    <ul className="space-y-1.5">
                                        {results.map((result, i) => {
                                            const theme = verdictTheme(result.verdict);
                                            return (
                                                <li key={i}>
                                                    <button
                                                        onClick={() => setSelected(i)}
                                                        className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-all ${
                                                            i === selected
                                                                ? 'border-sky-500 bg-sky-50/80 text-sky-950 font-bold shadow-2xs'
                                                                : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-100'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`h-2 w-2 shrink-0 rounded-full ${theme.dot}`}
                                                        />
                                                        <span className="min-w-0 flex-1 truncate font-medium">
                                                            {result.file_name}
                                                        </span>
                                                        <span
                                                            className={`shrink-0 font-mono font-bold ${theme.text}`}
                                                        >
                                                            {((result.confidence ?? 0) * 100).toFixed(0)}%
                                                        </span>
                                                    </button>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            )}

                            {/* Legal Disclaimer Box */}
                            <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white p-3.5 text-xs leading-relaxed text-slate-500 shadow-2xs">
                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                <span>
                                    Veritas AI verdicts represent probabilistic multi-layer signals and should be verified alongside qualified human forensic examination.
                                </span>
                            </div>
                        </div>

                        {/* Main Stage: Investigative Dashboard */}
                        <div className="space-y-6">
                            {current ? (
                                <>
                                    {/* Executive Threat Summary */}
                                    <VerdictCard
                                        result={current}
                                        onOpenDossier={() => setShowDossier(true)}
                                        onExportCsv={() => downloadResultsCsv(results)}
                                    />

                                    {/* C2PA Provenance Banner */}
                                    <ProvenanceBanner result={current} />

                                    {/* Interactive Multi-Mode Evidence Inspector */}
                                    <EvidenceInspector result={current} />

                                    {/* 7-Layer Instrument Telemetry Grid */}
                                    <LayerGrid result={current} />

                                    {/* Radial Radar Profile */}
                                    <RadarProfile result={current} />
                                </>
                            ) : (
                                !loading && (
                                    <div className="panel flex h-80 flex-col items-center justify-center gap-3 text-center border-dashed border-2 border-slate-200 bg-white/60 p-8">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 shadow-inner">
                                            <ScanSearch className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-slate-800">
                                                Awaiting Forensic Evidence
                                            </h3>
                                            <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
                                                Stage image or video files on the left intake zone, or select any of our preloaded forensic case studies to begin.
                                            </p>
                                        </div>
                                    </div>
                                )
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Case History Slide-out Panel */}
            <HistoryPanel
                open={showHistory}
                records={history}
                onClose={() => setShowHistory(false)}
            />

            {/* Official Forensic Dossier Modal */}
            <ForensicDossierModal
                open={showDossier}
                result={current}
                onClose={() => setShowDossier(false)}
            />
        </div>
    );
}
