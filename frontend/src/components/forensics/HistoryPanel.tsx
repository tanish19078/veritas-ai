import React, { useState } from 'react';
import {
    Activity,
    Calendar,
    CheckCircle2,
    FileSearch,
    Filter,
    History,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { formatTimestamp } from '../../lib/history';
import { HistoryRecord } from '../../types';
import { verdictTheme } from '../../lib/verdict';

interface HistoryPanelProps {
    open: boolean;
    records: HistoryRecord[];
    onClose: () => void;
    onSelectRecord?: (record: HistoryRecord) => void;
}

export default function HistoryPanel({
    open,
    records,
    onClose,
    onSelectRecord,
}: HistoryPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterVerdict, setFilterVerdict] = useState<string>('all');

    if (!open) return null;

    const filteredRecords = records.filter((rec) => {
        const matchesSearch = (rec.filename || '')
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;
        if (filterVerdict === 'all') return true;
        if (filterVerdict === 'ai' && rec.verdict === 'AI-Generated') return true;
        if (filterVerdict === 'real' && (rec.verdict === 'Real' || rec.verdict === 'Authentic'))
            return true;
        if (filterVerdict === 'suspicious' && rec.verdict?.includes('Suspicious')) return true;
        return true;
    });

    const totalCount = records.length;
    const aiCount = records.filter((r) => r.verdict === 'AI-Generated').length;
    const realCount = records.filter(
        (r) => r.verdict === 'Real' || r.verdict === 'Authentic'
    ).length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
                onClick={onClose}
            />

            {/* Slide-out Drawer */}
            <aside className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl transition-transform animate-fade-up">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 p-5 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-700">
                            <History className="h-4 w-4" />
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">
                                Forensic Audit History
                            </h2>
                            <p className="text-[11px] text-slate-500">
                                Persistent SQLite ledger of analyzed evidence files
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Summary Metrics Bar */}
                <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-50/80 p-3 text-center text-xs">
                    <div>
                        <span className="micro-label">Total Audits</span>
                        <p className="font-mono font-bold text-slate-800 text-sm">{totalCount}</p>
                    </div>
                    <div className="border-x border-slate-200">
                        <span className="micro-label">Synthetic</span>
                        <p className="font-mono font-bold text-rose-700 text-sm">{aiCount}</p>
                    </div>
                    <div>
                        <span className="micro-label">Authentic</span>
                        <p className="font-mono font-bold text-emerald-700 text-sm">{realCount}</p>
                    </div>
                </div>

                {/* Search & Filters */}
                <div className="p-4 border-b border-slate-100 space-y-2.5">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Filter case history by filename..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:border-sky-500 focus:outline-hidden"
                        />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                        {[
                            { id: 'all', label: 'All Cases' },
                            { id: 'ai', label: 'AI-Generated' },
                            { id: 'real', label: 'Authentic' },
                            { id: 'suspicious', label: 'Suspicious' },
                        ].map((btn) => (
                            <button
                                key={btn.id}
                                onClick={() => setFilterVerdict(btn.id)}
                                className={`rounded-md px-2.5 py-1 font-medium transition-colors ${
                                    filterVerdict === btn.id
                                        ? 'bg-slate-900 text-white'
                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                            >
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* History List */}
                <div className="flex-1 space-y-2 overflow-y-auto p-4">
                    {filteredRecords.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
                            <FileSearch className="h-8 w-8 mb-2 text-slate-300" />
                            <p className="text-xs font-medium">No forensic logs matching criteria.</p>
                        </div>
                    ) : (
                        filteredRecords.map((record) => {
                            const theme = verdictTheme(record.verdict ?? undefined);
                            return (
                                <div
                                    key={record.id}
                                    onClick={() => onSelectRecord && onSelectRecord(record)}
                                    className="panel panel-interactive flex items-center justify-between p-3 cursor-pointer shadow-2xs border-slate-200"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${theme.dot}`} />
                                        <div className="min-w-0">
                                            <p
                                                className="truncate text-xs font-bold text-slate-900"
                                                title={record.filename}
                                            >
                                                {record.filename}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5 font-mono text-[10px] text-slate-500">
                                                <span className="capitalize">{record.media_type || 'image'}</span>
                                                <span>·</span>
                                                <span>{formatTimestamp(record.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <span
                                            className={`rounded px-2 py-0.5 font-mono text-xs font-bold border ${theme.badgeBg}`}
                                        >
                                            {((record.confidence ?? 0) * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>
        </>
    );
}
