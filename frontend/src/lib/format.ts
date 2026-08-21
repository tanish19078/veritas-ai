import { AnalysisResult } from '../types';

export const csvEscape = (value: unknown): string => {
    const text = value === undefined || value === null ? '' : String(value);
    return `"${text.replace(/"/g, '""')}"`;
};

export const toScore = (value?: number | null): number =>
    typeof value === 'number' && Number.isFinite(value) ? value : 0;

export const toPercent = (value?: number | null): string =>
    `${(toScore(value) * 100).toFixed(1)}%`;

export function downloadResultsCsv(results: AnalysisResult[]): void {
    if (results.length === 0) return;

    const headers = [
        'File Name',
        'Media Type',
        'Verdict',
        'Confidence',
        'Metadata',
        'Biology',
        'Math',
        'AI Model',
        'Physics',
        'Signature',
        'ELA',
        'C2PA Verified',
        'Explanation',
    ];

    const rows = results.map((r) => [
        r.file_name ?? '',
        r.media_type ?? '',
        r.verdict,
        toPercent(r.confidence),
        r.layer_scores.metadata?.toFixed(3) ?? '',
        r.layer_scores.biology_rppg?.toFixed(3) ?? '',
        r.layer_scores.math_forensics?.toFixed(3) ?? '',
        r.layer_scores.ai_model?.toFixed(3) ?? '',
        r.layer_scores.physics?.toFixed(3) ?? '',
        r.layer_scores.early_signature?.toFixed(3) ?? '',
        r.layer_scores.ela?.toFixed(3) ?? '',
        r.is_verified ? 'yes' : 'no',
        r.explanation,
    ]);

    const csv =
        'data:text/csv;charset=utf-8,' +
        headers.map(csvEscape).join(',') +
        '\n' +
        rows.map((row) => row.map(csvEscape).join(',')).join('\n');

    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csv));
    link.setAttribute('download', 'veritas_ai_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
