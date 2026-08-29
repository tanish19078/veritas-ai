import React, { useState } from 'react';
import {
    Chart as ChartJS,
    Filler,
    Legend,
    LineElement,
    PointElement,
    RadialLinearScale,
    Tooltip,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Activity, Layers, PieChart, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../../types';
import { toScore } from '../../lib/format';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const LABELS = [
    'L1: Metadata',
    'L2: Biology',
    'L3: Math (FFT/CFA)',
    'L4: Neural Artifacts',
    'L5: Physics',
    'L6: Generator Sigs',
    'L7: ELA X-Ray',
];

const KEYS = [
    'metadata',
    'biology_rppg',
    'math_forensics',
    'ai_model',
    'physics',
    'early_signature',
    'ela',
] as const;

// Baseline synthetic benchmark for comparison
const BENCHMARK_SYNTHETIC = [0.85, 0.9, 0.95, 0.92, 0.8, 0.95, 0.85];
const BENCHMARK_AUTHENTIC = [0.05, 0.08, 0.06, 0.04, 0.08, 0.03, 0.05];

interface RadarProfileProps {
    result: AnalysisResult;
}

export default function RadarProfile({ result }: RadarProfileProps) {
    const [showBaseline, setShowBaseline] = useState(true);

    const subjectScores = KEYS.map((key) => toScore(result.layer_scores[key]));

    const datasets: Array<{
        label: string;
        data: number[];
        borderColor: string;
        backgroundColor: string;
        pointBackgroundColor: string;
        pointBorderColor: string;
        borderWidth: number;
        pointRadius: number;
    }> = [
        {
            label: 'Current Asset',
            data: subjectScores,
            borderColor: '#0284c7',
            backgroundColor: 'rgba(2, 132, 199, 0.16)',
            pointBackgroundColor: '#0284c7',
            pointBorderColor: '#ffffff',
            pointRadius: 4,
            borderWidth: 2.2,
        },
    ];

    if (showBaseline) {
        datasets.push({
            label: 'Authentic Baseline',
            data: BENCHMARK_AUTHENTIC,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.06)',
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#ffffff',
            pointRadius: 3,
            borderWidth: 1.5,
        });
    }

    const data = {
        labels: LABELS,
        datasets,
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                min: 0,
                max: 1,
                ticks: {
                    display: false,
                    stepSize: 0.25,
                },
                grid: {
                    color: 'rgba(15, 23, 42, 0.08)',
                },
                angleLines: {
                    color: 'rgba(15, 23, 42, 0.08)',
                },
                pointLabels: {
                    color: '#334155',
                    font: {
                        size: 11,
                        weight: '600' as const,
                        family: 'Inter, sans-serif',
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: '#0f172a',
                borderColor: '#e2e8f0',
                borderWidth: 1,
                titleColor: '#f8fafc',
                bodyColor: '#e2e8f0',
                padding: 10,
                callbacks: {
                    label: (ctx: { dataset: { label?: string }; raw: unknown }) =>
                        ` ${ctx.dataset.label}: ${(Number(ctx.raw) * 100).toFixed(1)}% anomaly probability`,
                },
            },
        },
    };

    return (
        <section className="panel animate-fade-up p-5 border-slate-200/90 bg-white">
            <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                        <PieChart className="h-4 w-4" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-slate-900">
                            Multi-Axis Forensic Radar
                        </h3>
                        <p className="text-[11px] text-slate-500">
                            Radial distribution across the seven investigative instruments
                        </p>
                    </div>
                </div>

                {/* Baseline comparison toggle */}
                <button
                    onClick={() => setShowBaseline(!showBaseline)}
                    className={`rounded-lg border px-2.5 py-1 font-mono text-[11px] font-medium transition-colors ${
                        showBaseline
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                            : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                >
                    {showBaseline ? '✓ Baseline Overlay' : '+ Baseline Overlay'}
                </button>
            </div>

            <div className="relative mx-auto h-72 w-full max-w-sm flex items-center justify-center">
                <Radar data={data} options={options as never} />
            </div>

            {/* Legend */}
            <div className="mt-3 flex items-center justify-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-sky-600" />
                    <span className="font-semibold text-slate-800">Current Asset</span>
                </div>
                {showBaseline && (
                    <div className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600">Authentic Camera Baseline</span>
                    </div>
                )}
            </div>
        </section>
    );
}
