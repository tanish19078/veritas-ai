import React, { useRef, useState } from 'react';
import { FileVideo, ImageIcon, Loader2, ScanSearch, X } from 'lucide-react';

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
        <section className="animate-fade-up">
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
                className={`panel panel-hover flex cursor-pointer flex-col items-center justify-center gap-4 px-8 py-14 text-center transition-all ${
                    dragging
                        ? 'border-cyan-400/60 shadow-glow ring-1 ring-cyan-400/40'
                        : 'border-dashed'
                }`}
            >
                <span
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl bg-brand transition-transform duration-300 ${
                        dragging ? 'scale-110' : ''
                    }`}
                >
                    <ScanSearch className="h-8 w-8 text-ink-950" strokeWidth={2.2} />
                </span>
                <div>
                    <p className="text-lg font-medium text-slate-100">
                        Drop images or videos to scan
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                        JPG · PNG · WEBP · MP4 · MOV · WEBM — batch uploads supported
                    </p>
                </div>
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
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    {staged.map((item, i) => (
                        <span
                            key={`${item.file.name}-${i}`}
                            className="group flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-slate-300"
                        >
                            {item.preview ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={item.preview}
                                    alt=""
                                    className="h-6 w-6 rounded-full object-cover"
                                />
                            ) : (
                                <FileVideo className="ml-1.5 h-4 w-4 text-indigo-300" />
                            )}
                            <span className="max-w-[160px] truncate">{item.file.name}</span>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeAt(i);
                                }}
                                className="text-slate-500 transition-colors hover:text-rose-400"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            <div className="mt-5 flex items-center gap-4">
                <button
                    onClick={runScan}
                    disabled={staged.length === 0 || loading}
                    className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-semibold text-ink-950 shadow-glow transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none"
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
                {staged.length > 0 && !loading && (
                    <span className="flex items-center gap-1.5 text-xs text-slate-500">
                        <ImageIcon className="h-3.5 w-3.5" />
                        {staged.length} file{staged.length > 1 ? 's' : ''} staged
                    </span>
                )}
            </div>
        </section>
    );
};

export default UploadZone;
