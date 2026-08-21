import { BadgeCheck } from 'lucide-react';
import { AnalysisResult } from '../../types';

const ProvenanceBanner = ({ result }: { result: AnalysisResult }) => {
    if (!result.is_verified) return null;

    const issuer = result.c2pa_data?.issuer ?? 'unknown signer';

    return (
        <div className="animate-fade-up flex items-start gap-3 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.06] p-4">
            <BadgeCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
            <div className="text-sm">
                <p className="font-medium text-emerald-200">
                    Content credentials verified
                </p>
                <p className="mt-0.5 text-emerald-200/60">
                    A valid C2PA manifest signed by <span className="font-mono">{issuer}</span>{' '}
                    was found. Metadata heuristics were overridden by cryptographic
                    provenance.
                </p>
            </div>
        </div>
    );
};

export default ProvenanceBanner;
