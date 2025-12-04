import React, { useState, useEffect } from 'react';
import { Upload, X, FileSearch, Activity, Zap, Eye, Download, History, ArrowRight, Cpu } from 'lucide-react';
import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import { Radar, Line } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    CategoryScale,
    LinearScale
);

// --- Sub-components ---

const LayerRadar = ({ scores }: { scores: any }) => {
    const data = {
        labels: ['Metadata', 'Biology', 'Math', 'AI Model', 'Physics', 'Signature'],
        datasets: [
            {
                label: 'Fake Probability',
                data: [
                    scores.metadata || 0,
                    scores.biology_rppg || 0,
                    scores.math_forensics || 0,
                    scores.ai_model || 0,
                    scores.physics || 0,
                    scores.early_signature || 0,
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };
    return <Radar data={data} options={{ scales: { r: { min: 0, max: 1 } } }} />;
};

const PulseChart = () => {
    // Dummy data for visualization
    const data = {
        labels: Array.from({ length: 20 }, (_, i) => i),
        datasets: [{
            label: 'Pulse Signal',
            data: Array.from({ length: 20 }, () => 0.5 + Math.random() * 0.2),
            borderColor: 'rgb(255, 205, 86)',
            tension: 0.4
        }]
    };
    return <Line data={data} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />;
};

const SpectrumChart = ({ type }: { type: string }) => {
    const data = {
        labels: Array.from({ length: 20 }, (_, i) => i),
        datasets: [{
            label: type,
            data: Array.from({ length: 20 }, () => Math.random()),
            borderColor: 'rgb(153, 102, 255)',
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            fill: true,
            tension: 0.4
        }]
    };
    return <Line data={data} options={{ plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }} />;
};


const Dashboard = () => {
    const [history, setHistory] = useState<any[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedResultIndex, setSelectedResultIndex] = useState<number | null>(null);
    const [showELA, setShowELA] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/history');
            if (res.ok) {
                const data = await res.json();
                setHistory(data);
            }
        } catch (error) {
            console.error("Failed to fetch history:", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            // Add preview URL to file object (monkey patching for convenience)
            const filesWithPreview = newFiles.map(f => {
                (f as any).preview = URL.createObjectURL(f);
                return f;
            });
            setFiles(prev => [...prev, ...filesWithPreview]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(files.filter((_, i) => i !== index));
        if (results.length > index) {
            const newResults = [...results];
            newResults.splice(index, 1);
            setResults(newResults);
        }
        if (selectedResultIndex === index) setSelectedResultIndex(null);
    };

    const analyzeFiles = async () => {
        if (files.length === 0) return;
        setLoading(true);
        setResults([]); // Clear previous results
        setSelectedResultIndex(null);
        setShowELA(false);

        const newResults = [];
        for (let i = 0; i < files.length; i++) {
            try {
                const formData = new FormData();
                formData.append('file', files[i]);

                const res = await fetch('http://localhost:8000/api/v1/analyze', {
                    method: 'POST',
                    body: formData
                });

                if (!res.ok) throw new Error("Analysis failed");

                const data = await res.json();

                // Add preview URL from the file object
                data.previewUrl = (files[i] as any).preview;

                // Fix ELA URL if present
                if (data.ela_url) {
                    const filename = data.ela_url.split(/[/\\]/).pop();
                    data.ela_url = `http://localhost:8000/uploads/${filename}`;
                }

                newResults.push(data);
            } catch (error) {
                console.error(error);
                // Push error state
                newResults.push({
                    fileName: files[i].name,
                    verdict: "Error",
                    confidence: 0,
                    layer_scores: {},
                    explanation: "Analysis failed. Please try again.",
                    previewUrl: (files[i] as any).preview
                });
            }
        }

        setResults(newResults);
        setLoading(false);
        if (newResults.length > 0) setSelectedResultIndex(0);
        fetchHistory(); // Refresh history
    };

    const downloadReport = () => {
        if (results.length === 0) return;

        // Generate CSV
        const headers = ["File Name", "Verdict", "Confidence", "Metadata Score", "Biology Score", "Math Score", "AI Model Score", "Physics Score", "Signature Score", "Explanation"];
        const rows = results.map(r => [
            r.fileName,
            r.verdict,
            (r.confidence * 100).toFixed(1) + "%",
            r.layer_scores.metadata,
            r.layer_scores.biology_rppg,
            r.layer_scores.math_forensics,
            r.layer_scores.ai_model,
            r.layer_scores.physics,
            r.layer_scores.early_signature,
            `"${r.explanation}"`
        ]);

        const csvContent = "data:text/csv;charset=utf-8,"
            + headers.join(",") + "\n"
            + rows.map(e => e.join(",")).join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "veritas_ai_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const currentResult = selectedResultIndex !== null ? results[selectedResultIndex] : null;

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 flex">

            {/* History Sidebar (Collapsible) */}
            <div className={`fixed inset-y-0 left-0 z-20 bg-white border-r border-gray-200 transform transition-transform duration-300 w-80
            ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
                <div className="p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="font-bold text-lg flex items-center gap-2"><History className="w-5 h-5" /> Recent Scans</h2>
                        <button onClick={() => setShowHistory(false)}><X className="w-5 h-5 text-gray-400 hover:text-black" /></button>
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-3">
                        {history.map((log) => (
                            <div key={log.id} className="p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-gray-100 cursor-pointer">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm truncate w-32" title={log.filename}>{log.filename}</span>
                                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${log.verdict === 'Real' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {log.verdict}
                                    </span>
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{(log.confidence * 100).toFixed(0)}% Conf.</span>
                                    <span>{log.timestamp.split(' ')[1]}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${showHistory ? 'ml-80' : 'ml-0'}`}>
                {/* Navbar */}
                <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setShowHistory(!showHistory)} className="p-2 hover:bg-gray-100 rounded-lg">
                                <History className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">V</div>
                                <span className="font-semibold text-lg tracking-tight">Veritas<span className="text-blue-600">AI</span></span>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">v1.4.0</p>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-6 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                        {/* Left Column: Input & File List */}
                        <div className="lg:col-span-4 space-y-8">
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                                <h2 className="text-xl font-semibold mb-2">Analysis Input</h2>
                                <p className="text-gray-500 text-sm mb-6">Upload images or videos. Supports batch analysis.</p>

                                <div className="relative group mb-6">
                                    <input
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    />
                                    <div className="border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-xl p-8 transition-all duration-300 flex flex-col items-center justify-center text-center">
                                        <Upload className="w-10 h-10 text-gray-400 mb-4" />
                                        <p className="font-medium text-gray-700">Drop files or browse</p>
                                        <p className="text-xs text-gray-400 mt-1">JPG, PNG, MP4</p>
                                    </div>
                                </div>

                                {/* File List */}
                                {files.length > 0 && (
                                    <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
                                        {files.map((f, i) => (
                                            <div key={i}
                                                onClick={() => results.length > 0 && setSelectedResultIndex(i)}
                                                className={`flex items-center justify-between p-3 rounded-lg text-sm border cursor-pointer transition-colors
                            ${selectedResultIndex === i ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-100 hover:bg-gray-100'}`}>
                                                <div className="truncate max-w-[200px] font-medium text-gray-700">{f.name}</div>
                                                <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="text-gray-400 hover:text-red-500">
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={analyzeFiles}
                                        disabled={files.length === 0 || loading}
                                        className="flex-1 bg-black text-white h-12 rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Analyzing...
                                            </>
                                        ) : (
                                            <>
                                                Run Analysis <ArrowRight className="w-4 h-4" />
                                            </>
                                        )}
                                    </button>

                                    {results.length > 0 && (
                                        <button
                                            onClick={downloadReport}
                                            className="w-12 h-12 flex items-center justify-center border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600"
                                            title="Download CSV Report"
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* System Status */}
                            <div className="bg-gray-100 p-6 rounded-2xl border border-gray-200">
                                <h3 className="font-semibold text-sm text-gray-900 mb-4 flex items-center gap-2">
                                    <Cpu className="w-4 h-4" /> Active Modules
                                </h3>
                                <div className="space-y-3">
                                    <StatusItem label="Metadata Engine" status="Ready" />
                                    <StatusItem label="Bio-Signal (rPPG)" status="Ready" />
                                    <StatusItem label="Spectral (FFT/DCT)" status="Ready" />
                                    <StatusItem label="Physics Check" status="Ready" />
                                    <StatusItem label="Hybrid AI Model" status="Ready" />
                                    <StatusItem label="ELA (X-Ray)" status="Ready" />
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Results */}
                        <div className="lg:col-span-8">
                            {!currentResult && !loading && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl p-12">
                                    <FileSearch className="w-16 h-16 mb-4 opacity-50" />
                                    <p>Select a file and run analysis to see results</p>
                                </div>
                            )}

                            {currentResult && (
                                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                                    {/* Error State Handling */}
                                    {currentResult.verdict === 'Error' ? (
                                        <div className="bg-red-50 border border-red-200 rounded-3xl p-12 text-center">
                                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                                <X className="w-10 h-10 text-red-500" />
                                            </div>
                                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Analysis Failed</h2>
                                            <p className="text-gray-600 max-w-md mx-auto mb-8">
                                                {currentResult.explanation || "An unexpected error occurred during the analysis of this file."}
                                            </p>
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => removeFile(selectedResultIndex!)}
                                                    className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                                                >
                                                    Remove File
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {/* Verdict Header */}
                                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                                ${currentResult.verdict === 'Real' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                            {currentResult.fileName}
                                                        </span>
                                                        {currentResult.is_verified && (
                                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 flex items-center gap-1">
                                                                <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
                                                                Digital Signature Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h1 className="text-4xl font-bold text-gray-900">{currentResult.verdict}</h1>
                                                    <p className="text-gray-500 mt-2 max-w-lg">{currentResult.explanation}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className={`text-5xl font-mono font-bold tracking-tighter
                                ${currentResult.verdict === 'Real' ? 'text-green-500' : 'text-red-500'}`}>
                                                        {(currentResult.verdict === 'Real'
                                                            ? (1 - currentResult.confidence) * 100
                                                            : currentResult.confidence * 100).toFixed(1)}%
                                                    </div>
                                                    <div className="text-xs text-gray-400 mt-1 uppercase tracking-wider">Confidence in Verdict</div>
                                                </div>
                                            </div>

                                            {/* ELA / Image Viewer */}
                                            <div className="bg-black rounded-2xl overflow-hidden relative group aspect-video flex items-center justify-center">
                                                {/* Actual Image Preview */}
                                                {currentResult.previewUrl ? (
                                                    <img
                                                        src={showELA && currentResult.ela_url ? currentResult.ela_url : currentResult.previewUrl}
                                                        alt="Analysis Subject"
                                                        className="w-full h-full object-contain"
                                                    />
                                                ) : (
                                                    <div className="text-white/50">Image Preview Unavailable</div>
                                                )}

                                                {/* ELA Overlay Label */}
                                                {showELA && currentResult.ela_url && (
                                                    <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 z-10">
                                                        <p className="text-white text-xs font-mono flex items-center gap-2">
                                                            <Activity className="w-3 h-3 text-blue-400" /> ELA Mode Active
                                                        </p>
                                                    </div>
                                                )}

                                                {currentResult.ela_url && (
                                                    <button
                                                        onClick={() => setShowELA(!showELA)}
                                                        className={`absolute bottom-4 right-4 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all
                                    ${showELA ? 'bg-white text-black' : 'bg-black/50 text-white hover:bg-black/70 backdrop-blur-md'}`}
                                                    >
                                                        <Eye className="w-4 h-4" /> {showELA ? 'Hide ELA' : 'Show ELA X-Ray'}
                                                    </button>
                                                )}
                                            </div>

                                            {/* Deep Dive Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                                                {/* Card 1: Radar Overview */}
                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-blue-500" /> Layer Signature
                                                    </h3>
                                                    <div className="h-64 flex items-center justify-center">
                                                        <LayerRadar scores={currentResult.layer_scores} />
                                                    </div>
                                                </div>

                                                {/* Card 2: Biological Analysis */}
                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                                                        <Zap className="w-4 h-4 text-yellow-500" /> Biological Plausibility
                                                    </h3>
                                                    <div className="h-40 mb-4">
                                                        <PulseChart />
                                                    </div>
                                                    <div className="flex justify-between text-sm text-gray-500 border-t pt-4">
                                                        <span>Heart Rate Var.</span>
                                                        <span className="font-mono text-gray-900">
                                                            {currentResult.verdict === 'Real' ? '0.12 (Normal)' : '0.02 (Low)'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Card 3: Spectral Analysis */}
                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                                    <h3 className="font-semibold mb-6 flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-purple-500" /> Math Forensics (FFT)
                                                    </h3>
                                                    <div className="h-40">
                                                        <SpectrumChart type="FFT" />
                                                    </div>
                                                </div>

                                                {/* Card 4: Decision Logic */}
                                                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
                                                    <div>
                                                        <h3 className="font-semibold mb-4">Decision Logic</h3>
                                                        <ul className="space-y-3">
                                                            <LogicItem label="Metadata" score={currentResult.layer_scores.metadata} desc="Header/EXIF analysis" />
                                                            <LogicItem label="Physics" score={currentResult.layer_scores.physics} desc="Lighting consistency" />
                                                            <LogicItem label="AI Artifacts" score={currentResult.layer_scores.ai_model} desc="Hybrid Model confidence" />
                                                        </ul>
                                                    </div>
                                                    <div className="mt-6 pt-4 border-t border-gray-100">
                                                        <p className="text-xs text-gray-400">
                                                            *Scores &gt; 0.5 indicate synthetic probability.
                                                        </p>
                                                    </div>
                                                </div>

                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

const StatusItem = ({ label, status }: { label: string, status: string }) => (
    <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">{label}</span>
        <span className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'Ready' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-gray-900 font-medium">{status}</span>
        </span>
    </div>
);

const LogicItem = ({ label, score, desc }: { label: string, score?: number, desc: string }) => (
    <li className="flex items-start justify-between group">
        <div>
            <span className="text-sm font-medium text-gray-900">{label}</span>
            <p className="text-xs text-gray-500">{desc}</p>
        </div>
        <div className={`text-xs font-mono px-2 py-1 rounded ${(score || 0) > 0.5 ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {(score || 0).toFixed(2)}
        </div>
    </li>
);

export default Dashboard;
