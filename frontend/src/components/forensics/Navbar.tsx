import Link from 'next/link';
import { FileText, Github, History, ShieldCheck } from 'lucide-react';

interface NavbarProps {
    apiOnline: boolean;
    onToggleHistory: () => void;
}

const iconButton =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] text-slate-400 transition-colors hover:border-white/20 hover:text-slate-100';

const Navbar = ({ apiOnline, onToggleHistory }: NavbarProps) => (
    <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-ink-950/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
            <Link href="/" className="group flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand shadow-glow transition-transform group-hover:scale-105">
                    <ShieldCheck className="h-5 w-5 text-ink-950" strokeWidth={2.4} />
                </span>
                <span className="text-lg font-semibold tracking-tight text-slate-100">
                    Veritas<span className="text-brand">·AI</span>
                </span>
            </Link>

            <div className="flex items-center gap-2">
                <span className="mr-1 hidden items-center gap-2 rounded-full border border-white/[0.08] px-3 py-1.5 text-xs text-slate-400 sm:flex">
                    <span
                        className={`h-2 w-2 rounded-full ${
                            apiOnline ? 'bg-emerald-400 animate-pulse-dot' : 'bg-rose-500'
                        }`}
                    />
                    {apiOnline ? 'API Online' : 'API Offline'}
                </span>

                <button onClick={onToggleHistory} className={iconButton} title="Scan history">
                    <History className="h-4 w-4" />
                </button>
                <Link href="/docs" className={iconButton} title="Documentation">
                    <FileText className="h-4 w-4" />
                </Link>
                <a
                    href="https://github.com/tanish19078/veritas-ai"
                    target="_blank"
                    rel="noreferrer"
                    className={iconButton}
                    title="GitHub"
                >
                    <Github className="h-4 w-4" />
                </a>
            </div>
        </div>
    </header>
);

export default Navbar;
