export interface VerdictTheme {
    label: string;
    text: string;
    badgeBg: string;
    border: string;
    dot: string;
    stroke: string;
}

const themes: Record<string, VerdictTheme> = {
    Real: {
        label: 'Authentic',
        text: 'text-emerald-300',
        badgeBg: 'bg-emerald-400/10',
        border: 'border-emerald-400/30',
        dot: 'bg-emerald-400',
        stroke: '#34d399',
    },
    'AI-Generated': {
        label: 'AI Generated',
        text: 'text-rose-300',
        badgeBg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500',
        stroke: '#f43f5e',
    },
    'Suspicious / Inconclusive': {
        label: 'Suspicious',
        text: 'text-amber-300',
        badgeBg: 'bg-amber-400/10',
        border: 'border-amber-400/30',
        dot: 'bg-amber-400',
        stroke: '#fbbf24',
    },
    Inconclusive: {
        label: 'Inconclusive',
        text: 'text-slate-300',
        badgeBg: 'bg-slate-400/10',
        border: 'border-slate-400/30',
        dot: 'bg-slate-400',
        stroke: '#94a3b8',
    },
    Error: {
        label: 'Scan Failed',
        text: 'text-rose-300',
        badgeBg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        dot: 'bg-rose-500',
        stroke: '#f43f5e',
    },
};

export function verdictTheme(verdict?: string): VerdictTheme {
    return themes[verdict ?? ''] ?? themes.Inconclusive;
}

export function scoreColor(score: number): string {
    if (score < 0.4) return 'bg-emerald-400';
    if (score < 0.7) return 'bg-amber-400';
    return 'bg-rose-500';
}
