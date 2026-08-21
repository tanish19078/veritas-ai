import React, { useRef, useState } from 'react';
import { FileVideo, Loader2, ScanSearch, X } from 'lucide-react';

interface StagedFile {
    file: File;
    preview: string;
}

interface UploadZoneProps {
    loading: boolean;
    progress: { done: number; total: number } | null;
    onAnalyze: (files: File[]) => void;
}

const isImage = (file: File) => file.type.startsWith('image/');

const UploadZone = ({ loading, progress, onAnalyze }: UploadZoneProps) => {
    const [staged, setStaged] = useState<StagedFile[]>([]);
    const [dragging, setDragging] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        const next = Array.from(incoming).map((file) => ({
            file,
            preview: isImage(file) ? URL.createObjectURL(file) : '',
        }));
        setStaged((prev) => [...prev, ...next]);
    };

    const removeAt = (index: number) => {
        setStaged((prev) => {
            URL.revokeObjectURL(prev[index].preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const runScan = () => {
        if (staged.length === 0 || loading) return;
        onAnalyze(staged.map((s) => s.file));
    };

    return (
        <section className="panel animate-fade-up relative overflow-hidden p-5">
            {loading && <div className="scan-sweep" />}

            <div className="mb-4 flex items-center justify-between">
                <h3 className="micro-label !text-slate-400">Evidence Intake</h3>
                {staged.length > 0 && (
                    <span className="font-mono text-[11px] text-slate-500">
                        {staged.length} staged
                    </span>
                )}
            </div>

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
                className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-6 py-10 text-center transition-all ${
                    dragging
                        ? 'border-cyan-400/70 bg-cyan-400/[0.05] shadow-glow'
                        : 'border-white/[0.12] hover:border-white/25 hover:bg-white/[0.02]'
                }`}
            >
                <span
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-brand shadow-glow transition-transform duration-300 ${
                        dragging ? 'scale-110' : ''
                    }`}
                >
                    <ScanSearch className="h-7 w-7 text-ink-950" strokeWidth={2.2} />
                </span>
                <p className="text-sm font-medium text-slate-200">
                    Drop evidence here
                </p>
                <p className="text-[11px] leading-relaxed text-slate-500">
                    JPG · PNG · WEBP · MP4 · MOV · WEBM
                    <br />
                    batch uploads supported
                </p>
                <input
                    ref={inputRef}
                    type="file"
                    multiple
                    accept="image/*,video/mp4,video/quicktime,video/webm,video/x-msvideo"
                    className="hidden"
                    onChange={(e) => {
                        addFiles(e.target.files);
                        e.target.value = '';
                    }}
                />
            </div>

            {staged.length > 0 && (
                <ul className="mt-4 max-h-44 space-y-1.5 overflow-y-auto pr-1">
                    {staged.map((item, i) => (
                        <li
                            key={`${item.file.name}-${i}`}
                            className="group flex items-center gap-2.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-1.5 pr-2.5 text-xs text-slate-300"
                        >
                            {item.preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.preview}
                                    alt=""
                                    className="h-7 w-7 rounded-md object-cover"
                                />
                            ) : (
                                <span className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-400/10">
                                    <FileVideo className="h-3.5 w-3.5 text-indigo-300" />
                                </span>
                            )}
                            <span className="min-w-0 flex-1 truncate">{item.file.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeAt(i);
                                }}
                                className="text-slate-600 transition-colors hover:text-rose-400"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            <button
                onClick={runScan}
                disabled={staged.length === 0 || loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-sm font-semibold text-ink-950 shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <ScanSearch className="h-4 w-4" />
                )}
                {loading
                    ? progress && progress.total > 1
                        ? `Scanning ${progress.done + 1}/${progress.total}…`
                        : 'Scanning…'
                    : 'Run Forensic Scan'}
            </button>

            {loading && progress && (
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                        className="h-full rounded-full bg-brand transition-all duration-500"
                        style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                </div>
            )}
        </section>
    );
};

export default UploadZone;
