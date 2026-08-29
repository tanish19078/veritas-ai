import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
    Activity,
    BookOpen,
    FileText,
    Github,
    History,
    Layers,
    Shield,
    ShieldCheck,
    Sliders,
    Sparkles,
} from 'lucide-react';
import { SAMPLE_SCENARIOS } from '../../lib/sampleData';
import { SampleScenario } from '../../types';

interface NavbarProps {
    apiOnline: boolean;
    onToggleHistory: () => void;
    onSelectSample?: (scenario: SampleScenario) => void;
    activeTab?: 'studio' | 'sandbox' | 'docs';
    onTabChange?: (tab: 'studio' | 'sandbox' | 'docs') => void;
}

export default function Navbar({
    apiOnline,
    onToggleHistory,
    onSelectSample,
    activeTab = 'studio',
    onTabChange,
}: NavbarProps) {
    const router = useRouter();
    const [sampleDropdownOpen, setSampleDropdownOpen] = useState(false);
    const isDocsPage = router.pathname === '/docs';

    return (
        <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Brand / Logo */}
                <div className="flex items-center gap-6">
                    <Link href="/" className="group flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-500/20 transition-transform group-hover:scale-105">
                            <ShieldCheck className="h-5 w-5" strokeWidth={2.4} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                                Veritas<span className="text-sky-600">·AI</span>
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mt-0.5">
                                Forensic Intelligence
                            </span>
                        </div>
                    </Link>

                    {/* Navigation Pills (Desktop) */}
                    {!isDocsPage && onTabChange && (
                        <nav className="hidden md:flex items-center rounded-lg bg-slate-100/90 p-1 border border-slate-200/60">
                            <button
                                onClick={() => onTabChange('studio')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                    activeTab === 'studio'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Layers className="h-3.5 w-3.5" />
                                Forensic Studio
                            </button>
                            <button
                                onClick={() => onTabChange('sandbox')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                                    activeTab === 'sandbox'
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-600 hover:text-slate-900'
                                }`}
                            >
                                <Sliders className="h-3.5 w-3.5" />
                                Calibration Sandbox
                            </button>
                        </nav>
                    )}
                </div>

                {/* Right controls */}
                <div className="flex items-center gap-2 sm:gap-3">
                    {/* Sample Scenarios Dropdown */}
                    {onSelectSample && (
                        <div className="relative">
                            <button
                                onClick={() => setSampleDropdownOpen(!sampleDropdownOpen)}
                                className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50/80 px-3 py-1.5 text-xs font-medium text-sky-800 shadow-sm transition-colors hover:bg-sky-100"
                                title="Load Demo Cases"
                            >
                                <Sparkles className="h-3.5 w-3.5 text-sky-600" />
                                <span className="hidden sm:inline">Try Demo Scenarios</span>
                                <span className="sm:hidden">Demos</span>
                            </button>

                            {sampleDropdownOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setSampleDropdownOpen(false)}
                                    />
                                    <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-40 animate-fade-up">
                                        <div className="px-3 py-1.5 border-b border-slate-100">
                                            <p className="micro-label !text-slate-500">Forensic Case Studies</p>
                                            <p className="text-[11px] text-slate-500 mt-0.5">
                                                Test detection layers instantly with real forensic datasets
                                            </p>
                                        </div>
                                        <div className="mt-1 space-y-1">
                                            {SAMPLE_SCENARIOS.map((scenario) => (
                                                <button
                                                    key={scenario.id}
                                                    onClick={() => {
                                                        onSelectSample(scenario);
                                                        setSampleDropdownOpen(false);
                                                    }}
                                                    className="w-full rounded-lg p-2 text-left transition-colors hover:bg-slate-50 flex items-start gap-2.5"
                                                >
                                                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700">
                                                        <Activity className="h-3.5 w-3.5" />
                                                    </span>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="flex items-center justify-between">
                                                            <p className="text-xs font-semibold text-slate-800 truncate">
                                                                {scenario.title}
                                                            </p>
                                                            <span
                                                                className={`rounded px-1.5 py-0.5 text-[9px] font-medium border ${scenario.badgeColor}`}
                                                            >
                                                                {scenario.badge}
                                                            </span>
                                                        </div>
                                                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                                                            {scenario.subtitle}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    {/* API Status indicator */}
                    <div
                        className={`hidden items-center gap-2 rounded-full border px-2.5 py-1 text-xs font-medium lg:flex ${
                            apiOnline
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-amber-200 bg-amber-50 text-amber-800'
                        }`}
                        title={
                            apiOnline
                                ? 'FastAPI Neural Backend connected'
                                : 'Backend offline - Interactive Standalone / Mock Engine active'
                        }
                    >
                        <span
                            className={`h-2 w-2 rounded-full ${
                                apiOnline ? 'bg-emerald-500 animate-pulse-dot' : 'bg-amber-500'
                            }`}
                        />
                        <span>{apiOnline ? 'FastAPI Online' : 'Demo Mode Active'}</span>
                    </div>

                    {/* History button */}
                    <button
                        onClick={onToggleHistory}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        title="Scan History & Audit Log"
                    >
                        <History className="h-4 w-4" />
                    </button>

                    {/* Docs button */}
                    <Link
                        href="/docs"
                        className={`flex h-9 w-9 items-center justify-center rounded-lg border shadow-sm transition-colors ${
                            isDocsPage
                                ? 'border-sky-300 bg-sky-50 text-sky-700'
                                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                        title="Knowledge Base & Documentation"
                    >
                        <BookOpen className="h-4 w-4" />
                    </Link>

                    {/* GitHub Link */}
                    <a
                        href="https://github.com/tanish19078/veritas-ai"
                        target="_blank"
                        rel="noreferrer"
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                        title="View Source on GitHub"
                    >
                        <Github className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </header>
    );
}
