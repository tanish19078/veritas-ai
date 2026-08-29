import React from 'react';
import { BadgeCheck, KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../../types';

interface ProvenanceBannerProps {
    result: AnalysisResult;
}

export default function ProvenanceBanner({ result }: ProvenanceBannerProps) {
    if (!result.is_verified) return null;

    const c2pa = result.c2pa_data || {};
    const issuer = c2pa.issuer ?? 'Verified Content Authority';
    const validationState = c2pa.validation_state ?? 'Cryptographic Signature Validated';
    const algorithm = c2pa.algorithm ?? 'Ed25519 / SHA-256';

    return (
        <div className="panel animate-fade-up border border-sky-200 bg-gradient-to-r from-sky-50/90 via-sky-50/50 to-indigo-50/50 p-4 sm:p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm shadow-sky-600/30">
                        <BadgeCheck className="h-5 w-5" strokeWidth={2.4} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-slate-900">
                                C2PA Content Credentials Verified
                            </h4>
                            <span className="rounded-full bg-sky-100 px-2 py-0.5 font-mono text-[10px] font-semibold text-sky-800 border border-sky-200">
                                Cryptographically Signed
                            </span>
                        </div>
                        <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                            Issued & authenticated by <strong className="font-semibold text-slate-800">{issuer}</strong>.
                            Cryptographic asset provenance overrides all metadata heuristics.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-sky-200/60 pt-2.5 sm:border-t-0 sm:pt-0">
                    <div className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-white px-2.5 py-1 text-[11px] font-mono text-sky-900 shadow-2xs">
                        <KeyRound className="h-3 w-3 text-sky-600" />
                        <span>{algorithm}</span>
                    </div>
                    <div className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                        <ShieldCheck className="h-3 w-3 text-emerald-600" />
                        <span>Valid Chain</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
