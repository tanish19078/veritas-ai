import { AnalysisResult, HistoryRecord } from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function analyzeFile(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE_URL}/api/v1/analyze`, {
        method: 'POST',
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Analysis failed' }));
        throw new Error((err as { detail?: string }).detail || 'Analysis failed');
    }
    return res.json();
}

export async function fetchHistory(limit = 12): Promise<HistoryRecord[]> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/v1/history?limit=${limit}`);
        if (!res.ok) return [];
        return res.json();
    } catch {
        return [];
    }
}

export async function checkApiHealth(): Promise<boolean> {
    try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${API_BASE_URL}/`, { signal: controller.signal });
        clearTimeout(timer);
        return res.ok;
    } catch {
        return false;
    }
}

export function elaFullUrl(elaUrl?: string | null): string | null {
    if (!elaUrl) return null;
    const filename = elaUrl.split(/[/\\]/).pop();
    return `${API_BASE_URL}/uploads/${filename}`;
}
