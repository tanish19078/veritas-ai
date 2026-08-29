import React, { useRef, useState } from 'react';
import {
    FileSearch,
    FileVideo,
    FolderUp,
    ImageIcon,
    Loader2,
    Play,
    ScanSearch,
    Sparkles,
    Trash2,
    UploadCloud,
    X,
} from 'lucide-react';
import { formatBytes } from '../../lib/format';
import { SAMPLE_SCENARIOS } from '../../lib/sampleData';
import { SampleScenario } from '../../types';

interface StagedFile {
    file: File;
    preview: string;
    size: number;
    type: string;
}

interface UploadZoneProps {
    loading: boolean;
    progress: { done: number; total: number } | null;
    onAnalyze: (files: File[]) => void;
    onSelectSample?: (scenario: SampleScenario) => void;
}

const isImage = (file: File) => file.type.startsWith('image/');

export default function UploadZone({
    loading,
    progress,
    onAnalyze,
    onSelectSample,
}: UploadZoneProps) {
    const [staged, setStaged] = useState<StagedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const next: StagedFile[] = Array.from(incoming).map((file) => ({
            file,
            preview: isImage(file) ? URL.createObjectURL(file) : '',
            size: file.size,
            type: file.type,
        }));
        setStaged((prev) => [...prev, ...next]);
    };

    const removeAt = (index: number) => {
        setStaged((prev) => {
            if (prev[index].preview) {
                URL.revokeObjectURL(prev[index].preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const clearAll = () => {
        staged.forEach((item) => {
            if (item.preview) URL.revokeObjectURL(item.preview);
        });
        setStaged([]);
    };

    const runScan = () => {
        if (staged.length === 0 || loading) return;
        onAnalyze(staged.map((s) => s.file));
    };

    return (
        <section className="panel animate-fade-up relative overflow-hidden p-5 border-slate-200/90 bg-white">
            {/* Animated Laser Scanning Line during analysis */}
            {loading && <div className="scan-laser" />}

            {/* Header */}
            <div className="mb-3.5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <FolderUp className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Evidence Intake & Staging
                        </h3>
                    </div>
                </div>

                {staged.length > 0 && (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                            {staged.length} staged
                        </span>
                        <button
                            onClick={clearAll}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            title="Clear all staged files"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* Drop Zone Box */}
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setDragging(false);
                    addFiles(e.dataTransfer.files);
                }}
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-9 text-center transition-all ${
                    dragging
                        ? 'border-sky-500 bg-sky-50/80 shadow-md scale-[1.01]'
                        : 'border-slate-300/80 bg-slate-50/60 hover:border-sky-400 hover:bg-sky-50/30'
                }`}
            >
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl bg-sky-600 text-white shadow-md shadow-sky-600/20 transition-transform ${
                        dragging ? 'scale-110' : ''
                    }`}
                >
                    <UploadCloud className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <div>
                    <p className="text-sm font-bold text-slate-800">
                        Drop media evidence here, or{' '}
                        <span className="text-sky-600 underline">browse files</span>
                    </p>
                    <p className="mt-1 font-mono text-[11px] text-slate-500">
                        JPG · PNG · WEBP · TIFF · MP4 · MOV · WEBM · MKV
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/quicktime,video/webm,video/x-msvideo,video/x-matroska"
                    className="hidden"
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
            </div>

            {/* Staged File List */}
            {staged.length > 0 && (
                <div className="mt-3.5">
                    <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
                        {staged.map((item, i) => (
                            <li
                                key={`${item.file.name}-${i}`}
                                className="group flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white p-2 text-xs text-slate-800 shadow-2xs"
                            >
                                {item.preview ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={item.preview}
                                        alt=""
                                        className="h-8 w-8 rounded-md object-cover border border-slate-200"
                                    />
                                ) : (
                                    <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-50 text-indigo-600 border border-indigo-100">
                                        <FileVideo className="h-4 w-4" />
                                    </span>
                                )}
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-semibold text-slate-900 leading-tight">
                                        {item.file.name}
                                    </p>
                                    <p className="font-mono text-[10px] text-slate-500 mt-0.5">
                                        {formatBytes(item.size)}
                                    </p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeAt(i);
                                    }}
                                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Primary Action Button */}
            <button
                onClick={runScan}
                disabled={staged.length === 0 || loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs sm:text-sm font-bold text-white shadow-md transition-all hover:bg-slate-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
                {loading ? (
                    <>
                        <Loader2 className="h-4 w-4 animate-spin text-sky-400" />
                        <span>
                            {progress && progress.total > 1
                                ? `Analyzing Subject ${progress.done + 1}/${progress.total}…`
                                : 'Running 7-Layer Forensic Pipeline…'}
                        </span>
                    </>
                ) : (
                    <>
                        <ScanSearch className="h-4 w-4 text-sky-400" />
                        <span>
                            {staged.length > 1
                                ? `Scan Batch (${staged.length} Assets)`
                                : 'Run Forensic Analysis'}
                        </span>
                    </>
                )}
            </button>

            {/* Progress Bar for Batch Scans */}
            {loading && progress && progress.total > 1 && (
                <div className="mt-2.5">
                    <div className="flex justify-between font-mono text-[10px] text-slate-500 mb-1">
                        <span>Batch Progress</span>
                        <span>
                            {progress.done}/{progress.total} Complete
                        </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                            className="h-full rounded-full bg-sky-600 transition-all duration-300"
                            style={{ width: `${(progress.done / progress.total) * 100}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Sample Quick Launchers */}
            {onSelectSample && (
                <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                        <span className="micro-label !text-slate-500 flex items-center gap-1">
                            <Sparkles className="h-3 w-3 text-sky-600" />
                            1-Click Demo Scenarios
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        {SAMPLE_SCENARIOS.slice(0, 4).map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => onSelectSample(scenario)}
                                className="flex items-center gap-1.5 rounded-lg border border-slate-200/80 bg-slate-50/70 px-2 py-1.5 text-left text-[11px] font-medium text-slate-700 transition-all hover:border-sky-300 hover:bg-sky-50/50 hover:text-sky-900"
                            >
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-sky-500" />
                                <span className="truncate">{scenario.title.split(' ')[0]} {scenario.title.split(' ')[1]}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
