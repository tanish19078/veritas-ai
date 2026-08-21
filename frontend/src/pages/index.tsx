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
            <div className="bg-lab" />
            <Navbar apiOnline={apiOnline} onToggleHistory={() => setShowHistory((v) => !v)} />

            <main className="mx-auto max-w-6xl px-6 pb-24">
                <section className="animate-fade-up py-14 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-slate-100 sm:text-5xl">
                        Deepfake forensics,<span className="text-brand"> seven layers deep</span>
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base">
                        Metadata provenance, cardiac-band rPPG, frequency forensics, learned
                        artifacts, physics consistency and compression analysis — synthesized
                        into one transparent verdict.
                    </p>
                </section>

                <UploadZone loading={loading} progress={progress} onAnalyze={handleAnalyze} />

                {!loading && results.length === 0 && (
                    <div className="animate-fade-up-slow mt-10 flex items-center justify-center gap-2 text-xs text-slate-600">
                        <ShieldAlert className="h-3.5 w-3.5" />
                        Demo tool — not courtroom-grade forensic evidence.
                    </div>
                )}

                {results.length > 1 && (
                    <div className="mt-12 flex gap-2 overflow-x-auto pb-2">
                        {results.map((result, i) => {
                            const theme = verdictTheme(result.verdict);
                            return (
                                <button
                                    key={i}
                                    onClick={() => setSelected(i)}
                                    className={`flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs transition-colors ${
                                        i === selected
                                            ? 'border-cyan-400/40 bg-cyan-400/[0.07] text-slate-100'
                                            : 'border-white/[0.07] bg-white/[0.02] text-slate-400 hover:border-white/20'
                                    }`}
                                >
                                    <span className={`h-1.5 w-1.5 rounded-full ${theme.dot}`} />
                                    <span className="max-w-[140px] truncate">
                                        {result.file_name}
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                )}

                {current && (
                    <div className="mt-10 space-y-5">
                        <VerdictCard result={current} />
                        <ProvenanceBanner result={current} />
                        <LayerGrid result={current} />

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <RadarProfile result={current} />
                            <div className="space-y-5">
                                <ElaViewer result={current} />
                            </div>
                        </div>

                        <PulseWave result={current} />

                        {results.length > 0 && (
                            <div className="flex justify-end">
                                <button
                                    onClick={() => downloadResultsCsv(results)}
                                    className="flex items-center gap-2 rounded-xl border border-white/[0.08] px-4 py-2.5 text-sm text-slate-300 transition-colors hover:border-white/20 hover:text-slate-100"
                                >
                                    <Download className="h-4 w-4" />
                                    Export CSV report
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </main>

            <HistoryPanel
                open={showHistory}
                records={history}
                onClose={() => setShowHistory(false)}
            />
        </div>
    );
}
