import {
    Chart as ChartJS,
    Filler,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { AnalysisResult } from '../../types';
import { toScore } from '../../lib/format';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip);

const LABELS = ['Metadata', 'Biology', 'Math', 'AI Model', 'Physics', 'Signature', 'ELA'];
const KEYS = [
    'metadata',
    'biology_rppg',
    'math_forensics',
    'ai_model',
    'physics',
    'early_signature',
    'ela',
] as const;

const RadarProfile = ({ result }: { result: AnalysisResult }) => {
    const data = {
        labels: LABELS,
        datasets: [
            {
                label: 'Fake probability',
                data: KEYS.map((key) => toScore(result.layer_scores[key])),
                borderColor: '#22d3ee',
                backgroundColor: 'rgba(34, 211, 238, 0.14)',
                pointBackgroundColor: '#22d3ee',
                pointBorderColor: '#04060c',
                pointRadius: 3.5,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        scales: {
            r: {
                min: 0,
                max: 1,
                ticks: { display: false, stepSize: 0.25 },
                grid: { color: 'rgba(148, 163, 184, 0.12)' },
                angleLines: { color: 'rgba(148, 163, 184, 0.12)' },
                pointLabels: {
                    color: '#94a3b8',
                    font: { size: 11, family: 'Inter, sans-serif' },
                },
            },
        },
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#0b1120',
                borderColor: 'rgba(148,163,184,0.2)',
                borderWidth: 1,
                titleColor: '#e2e8f0',
                bodyColor: '#94a3b8',
                callbacks: {
                    label: (ctx: any) =>
                        ` ${(Number(ctx.raw) * 100).toFixed(1)}% fake probability`,
                },
            },
        },
    };

    return (
        <section className="panel animate-fade-up p-5">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-widest text-slate-400">
                Layer Profile
            </h3>
            <div className="mx-auto max-w-sm">
                <Radar data={data} options={options as never} />
            </div>
        </section>
    );
};

export default RadarProfile;
