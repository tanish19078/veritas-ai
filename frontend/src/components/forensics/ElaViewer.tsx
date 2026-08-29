import React, { useState } from 'react';
import { Eye, Image as ImageIcon } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { elaFullUrl } from '../../lib/api';

export default function ElaViewer({ result }: { result: AnalysisResult }) {
    const [showEla, setShowEla] = useState(false);
    const elaUrl = elaFullUrl(result.ela_url);

    if (!result.previewUrl && !elaUrl) return null;

    return (
        <section className="panel animate-fade-up p-5 border-slate-200 bg-white">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="micro-label !text-slate-700 flex items-center gap-2">
                    <Eye className="h-4 w-4 text-sky-600" /> Compression X-Ray
                </h3>
                {elaUrl && (
                    <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs">
                        <button
                            onClick={() => setShowEla(false)}
                            className={`rounded-md px-3 py-1 font-medium transition-colors ${
                                !showEla
                                    ? 'bg-white text-slate-900 shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            Original
                        </button>
                        <button
                            onClick={() => setShowEla(true)}
                            className={`rounded-md px-3 py-1 font-medium transition-colors ${
                                showEla
                                    ? 'bg-sky-600 text-white shadow-2xs'
                                    : 'text-slate-500 hover:text-slate-800'
                            }`}
                        >
                            ELA X-Ray
                        </button>
                    </div>
                )}
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
                {showEla && elaUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={elaUrl}
                        alt="ELA analysis"
                        className="mx-auto max-h-[380px] w-auto object-contain"
                    />
                ) : result.previewUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        src={result.previewUrl}
                        alt={result.file_name}
                        className="mx-auto max-h-[380px] w-auto object-contain"
                    />
                ) : (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-slate-400">
                        <ImageIcon className="h-8 w-8 text-slate-500" />
                        <span className="text-xs">No preview available</span>
                    </div>
                )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
                Error Level Analysis highlights regions that respond differently to JPEG re-compression — spliced or edited areas typically glow brighter than surrounding textures.
            </p>
        </section>
    );
}
