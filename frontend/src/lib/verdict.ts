export interface VerdictTheme {
    label: string;
    text: string;
    badgeBg: string;
    border: string;
    dot: string;
    stroke: string;
    glow: string;
    subtleBg: string;
    cardBg: string;
}

const themes: Record<string, VerdictTheme> = {
    Real: {
        label: 'Authentic Media',
        text: 'text-emerald-700',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        stroke: '#059669',
        glow: 'rgba(16, 185, 129, 0.12)',
        subtleBg: 'bg-emerald-50/60',
        cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20',
    },
    Authentic: {
        label: 'Authentic Media',
        text: 'text-emerald-700',
        badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        border: 'border-emerald-300',
        dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
        stroke: '#059669',
        glow: 'rgba(16, 185, 129, 0.12)',
        subtleBg: 'bg-emerald-50/60',
        cardBg: 'bg-gradient-to-br from-emerald-50/40 via-white to-emerald-50/20',
    },
    'AI-Generated': {
        label: 'Synthetic / AI-Generated',
        text: 'text-rose-700',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        border: 'border-rose-300',
        dot: 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]',
        stroke: '#e11d48',
        glow: 'rgba(244, 63, 94, 0.12)',
        subtleBg: 'bg-rose-50/60',
        cardBg: 'bg-gradient-to-br from-rose-50/40 via-white to-rose-50/20',
    },
    'Suspicious / Inconclusive': {
        label: 'Suspicious Anomalies',
        text: 'text-amber-700',
        badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
        border: 'border-amber-300',
        dot: 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]',
        stroke: '#d97706',
        glow: 'rgba(245, 158, 11, 0.12)',
        subtleBg: 'bg-amber-50/60',
        cardBg: 'bg-gradient-to-br from-amber-50/40 via-white to-amber-50/20',
    },
    Inconclusive: {
        label: 'Inconclusive Signal',
        text: 'text-slate-700',
        badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
        border: 'border-slate-300',
        dot: 'bg-slate-400',
        stroke: '#64748b',
        glow: 'rgba(100, 116, 139, 0.08)',
        subtleBg: 'bg-slate-50',
        cardBg: 'bg-white',
    },
    Error: {
        label: 'Analysis Error',
        text: 'text-rose-700',
        badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
        border: 'border-rose-300',
        dot: 'bg-rose-500',
        stroke: '#e11d48',
        glow: 'rgba(244, 63, 94, 0.12)',
        subtleBg: 'bg-rose-50/60',
        cardBg: 'bg-white',
    },
};

export function verdictTheme(verdict?: string): VerdictTheme {
    return themes[verdict ?? ''] ?? themes.Inconclusive;
}

export function scoreColor(score: number): string {
    if (score < 0.35) return 'bg-emerald-500';
    if (score < 0.68) return 'bg-amber-500';
    return 'bg-rose-500';
}

export function scoreTextColor(score: number): string {
    if (score < 0.35) return 'text-emerald-700';
    if (score < 0.68) return 'text-amber-700';
    return 'text-rose-700';
}

export function scoreBadgeColor(score: number): string {
    if (score < 0.35) return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (score < 0.68) return 'bg-amber-50 text-amber-700 border-amber-200';
    return 'bg-rose-50 text-rose-700 border-rose-200';
}

export function getThreatAssessment(confidence: number): {
    rating: 'LOW RISK' | 'ELEVATED RISK' | 'HIGH RISK' | 'CRITICAL THREAT';
    color: string;
    description: string;
} {
    if (confidence > 0.8) {
        return {
            rating: 'CRITICAL THREAT',
            color: 'text-rose-700 bg-rose-50 border-rose-200',
            description: 'Synthetic generation fingerprints across multiple independent frequency & artifact layers.',
        };
    }
    if (confidence > 0.6) {
        return {
            rating: 'HIGH RISK',
            color: 'text-rose-700 bg-rose-50 border-rose-200',
            description: 'Significant neural artifact and spectral anomalies detected above baseline thresholds.',
        };
    }
    if (confidence > 0.35) {
        return {
            rating: 'ELEVATED RISK',
            color: 'text-amber-700 bg-amber-50 border-amber-200',
            description: 'Inconclusive or mixed biological and compression metrics; manual analyst review advised.',
        };
    }
    return {
        rating: 'LOW RISK',
        color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
        description: 'Authentic camera sensor noise patterns and natural biological pulse signals observed.',
    };
}
