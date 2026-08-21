import { useCallback, useEffect, useState } from 'react';
import { Download, ShieldAlert } from 'lucide-react';

import { AnalysisResult, HistoryRecord } from '../types';
import { analyzeFile, checkApiHealth, fetchHistory } from '../lib/api';
import { downloadResultsCsv } from '../lib/format';
import { verdictTheme } from '../lib/verdict';

import Navbar from '../components/forensics/Navbar';
import UploadZone from '../components/forensics/UploadZone';
import VerdictCard from '../components/forensics/VerdictCard';
import ProvenanceBanner from '../components/forensics/ProvenanceBanner';
import LayerGrid from '../components/forensics/LayerGrid';
import RadarProfile from '../components/forensics/RadarProfile';
import PulseWave from '../components/forensics/PulseWave';
import ElaViewer from '../components/forensics/ElaViewer';
import HistoryPanel from '../components/forensics/HistoryPanel';

export default function Home() {
    const [apiOnline, setApiOnline] = useState(false);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
    const [results, setResults] = useState<AnalysisResult[]>([]);
    const [selected, setSelected] = useState(0);
    const [history, setHistory] = useState<HistoryRecord[]>([]);
    const [showHistory, setShowHistory] = useState(false);

    const refreshHistory = useCallback(() => {
        fetchHistory().then(setHistory);
    }, []);

    useEffect(() => {
        checkApiHealth().then(setApiOnline);
        refreshHistory();
    }, [refreshHistory]);

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
                collected.push(data);
            } catch (error) {
                collected.push({
                    verdict: 'Error',
                    confidence: 0,
                    layer_scores: {},
                    explanation:
                        error instanceof Error ? error.message : 'Analysis failed.',
                    details: {},
                    is_verified: false,
                    c2pa_data: {},
                    file_name: files[i].name,
                    previewUrl: URL.createObjectURL(files[i]),
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

    const current = results[selected];

    return (
        <div className="min-h-screen">
            <div className="bg-lab">
                <div className="lab-grid" />
                <div className="lab-glow-cyan" />
                <div className="lab-glow-violet" />
            </div>

            <Navbar apiOnline={apiOnline} onToggleHistory={() => setShowHistory((v) => !v)} />

            <main className="mx-auto max-w-7xl px-6 pb-24 pt-10">
                {/* Hero */}
                <section className="animate-fade-up mb-10 max-w-3xl">
                    <p className="micro-label mb-3">Multi-layer deepfake forensics</p>
                    <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-50 sm:text-[2.75rem]">
                        Seven instruments.
                        <br />
                        <span className="text-brand">One verdict.</span>
                    </h1>
                    <p className="mt-4 max-w-xl text-sm leading-relaxed text-slate-400">
                        Provenance, cardiac-band rPPG, frequency forensics, learned artifacts,
                        physics consistency and compression analysis — synthesized into a
                        transparent confidence score.
                    </p>
                </section>

                {/* Two-column workspace */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
                    {/* Left rail */}
                    <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                        <UploadZone loading={loading} progress={progress} onAnalyze={handleAnalyze} />

                        {!loading && results.length === 0 && (
                            <div className="flex items-start gap-2.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 text-xs leading-relaxed text-slate-500">
                                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                                Demo tool — verdicts are probabilistic signals, not
                                courtroom-grade forensic evidence.
                            </div>
                        )}

                        {results.length > 1 && (
                            <div className="panel animate-fade-up p-4">
                                <h3 className="micro-label !text-slate-400 mb-3">Session queue</h3>
                                <ul className="space-y-1.5">
                                    {results.map((result, i) => {
                                        const theme = verdictTheme(result.verdict);
                                        return (
                                            <li key={i}>
                                                <button
                                                    onClick={() => setSelected(i)}
                                                    className={`flex w-full items-center gap-2.5 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                                                        i === selected
                                                            ? 'border-cyan-400/40 bg-cyan-400/[0.07] text-slate-100'
                                                            : 'border-transparent text-slate-400 hover:bg-white/[0.04]'
                                                    }`}
                                                >
                                                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${theme.dot}`} />
                                                    <span className="min-w-0 flex-1 truncate">
                                                        {result.file_name}
                                                    </span>
                                                    <span className={`shrink-0 font-mono ${theme.text}`}>
                                                        {((result.confidence ?? 0) * 100).toFixed(0)}%
                                                    </span>
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Main stage */}
                    <div className="space-y-5">
                        {current ? (
                            <>
                                <VerdictCard result={current} />
                                <ProvenanceBanner result={current} />
                                <LayerGrid result={current} />

                                <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                                    <RadarProfile result={current} />
                                    <ElaViewer result={current} />
                                </div>

                                <PulseWave result={current} />

                                <div className="flex justify-end">
                                    <button
                                        onClick={() => downloadResultsCsv(results)}
                                        className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-slate-100"
                                    >
                                        <Download className="h-4 w-4" />
                                        Export CSV report
                                    </button>
                                </div>
                            </>
                        ) : (
                            !loading && (
                                <div className="panel animate-fade-up-slow flex h-72 flex-col items-center justify-center gap-3 text-center">
                                    <span className="micro-label">Awaiting evidence</span>
                                    <p className="max-w-xs text-sm text-slate-500">
                                        Stage files on the left and run the scan — the full
                                        seven-layer dossier will appear here.
                                    </p>
                                </div>
                            )
                        )}
                    </div>
                </div>
            </main>

            <HistoryPanel
                open={showHistory}
                records={history}
                onClose={() => setShowHistory(false)}
            />
        </div>
    );
}
