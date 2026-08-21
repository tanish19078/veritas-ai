import { formatTimestamp } from '../../lib/history';
import { HistoryRecord } from '../../types';
import { verdictTheme } from '../../lib/verdict';
import { X } from 'lucide-react';

interface HistoryPanelProps {
    open: boolean;
    records: HistoryRecord[];
    onClose: () => void;
}

const HistoryPanel = ({ open, records, onClose }: HistoryPanelProps) => (
    <>
        {open && (
            <div
                className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            />
        )}
        <aside
            className={`fixed inset-y-0 right-0 z-50 flex w-80 flex-col border-l border-white/[0.07] bg-ink-900/95 shadow-panel backdrop-blur-xl transition-transform duration-300 ${
                open ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
            <div className="flex items-center justify-between border-b border-white/[0.06] p-5">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-300">
                    Recent Scans
                </h2>
                <button
                    onClick={onClose}
                    className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/[0.06] hover:text-slate-200"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex-1 space-y-2 overflow-y-auto p-4">
                {records.length === 0 && (
                    <p className="px-2 py-8 text-center text-sm text-slate-600">
                        No scans yet.
                    </p>
                )}
                {records.map((record) => {
                    const theme = verdictTheme(record.verdict ?? undefined);
                    return (
                        <div
                            key={record.id}
                            className="panel panel-hover flex items-center gap-3 p-3"
                        >
                            <span className={`h-2 w-2 shrink-0 rounded-full ${theme.dot}`} />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm text-slate-200" title={record.filename}>
                                    {record.filename}
                                </p>
                                <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                                    {formatTimestamp(record.timestamp)}
                                </p>
                            </div>
                            <span className={`shrink-0 font-mono text-xs ${theme.text}`}>
                                {((record.confidence ?? 0) * 100).toFixed(0)}%
                            </span>
                        </div>
                    );
                })}
            </div>
        </aside>
    </>
);

export default HistoryPanel;
