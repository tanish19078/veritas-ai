import { HistoryRecord } from '../types';

export const formatTimestamp = (timestamp?: string): string => {
    if (!timestamp) return '';
    const parsed = new Date(timestamp);
    return Number.isNaN(parsed.getTime()) ? timestamp : parsed.toLocaleString();
};
