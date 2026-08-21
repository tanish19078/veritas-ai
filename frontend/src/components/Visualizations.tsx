import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler,
} from 'chart.js';
import { Line, Bar, Radar } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    RadialLinearScale,
    Title,
    Tooltip,
    Legend,
    Filler
);

export const PulseChart = () => {
    const labels = Array.from({ length: 50 }, (_, i) => i);
    // Simulate a "flatline" or weak pulse for AI, or strong for Real
    // We'll generate a random-ish wave
    const dataPoints = labels.map(i => Math.sin(i * 0.5) * 0.2 + 0.5 + (Math.random() * 0.05));

    const data = {
        labels,
        datasets: [
            {
                label: 'rPPG Signal (Green Channel)',
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Biological Pulse Detection' },
        },
        scales: {
            y: { min: 0, max: 1 },
            x: { display: false }
        }
    };

    return <Line options={options} data={data} />;
};

export const SpectrumChart = ({ type }: { type: 'FFT' | 'DCT' }) => {
    const labels = Array.from({ length: 20 }, (_, i) => i);
    // Simulate high frequency artifacts for AI
    const dataPoints = labels.map(i => (i > 15 ? Math.random() * 0.8 : Math.random() * 0.3));

    const data = {
        labels,
        datasets: [
            {
                label: `${type} Energy Distribution`,
                data: dataPoints,
                backgroundColor: type === 'FFT' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: `${type} Frequency Analysis` },
        },
        scales: {
            x: { display: false },
        }
    };

    return <Bar options={options} data={data} />;
};

export const LayerRadar = ({ scores }: { scores: any }) => {
    const data = {
        labels: ['Metadata', 'Biology', 'Math', 'AI Model', 'Physics', 'Signature'],
        datasets: [
            {
                label: 'Fake Probability',
                data: [
                    scores.metadata,
                    scores.biology_rppg,
                    scores.math_forensics,
                    scores.ai_model,
                    scores.physics,
                    scores.early_signature
                ],
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            r: {
                angleLines: { display: true },
                suggestedMin: 0,
                suggestedMax: 1,
            },
        },
    };

    return <Radar data={data} options={options} />;
};
