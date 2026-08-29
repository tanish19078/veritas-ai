/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'var(--font-sans)',
                    'Inter',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'Helvetica Neue',
                    'sans-serif',
                ],
                mono: [
                    'var(--font-mono)',
                    'JetBrains Mono',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'Monaco',
                    'Consolas',
                    'monospace',
                ],
            },
            colors: {
                lab: {
                    50: '#f8fafc',
                    100: '#f1f5f9',
                    200: '#e2e8f0',
                    300: '#cbd5e1',
                    400: '#94a3b8',
                    500: '#64748b',
                    600: '#475569',
                    700: '#334155',
                    800: '#1e293b',
                    900: '#0f172a',
                    950: '#020617',
                },
                forensic: {
                    real: '#059669',
                    fake: '#e11d48',
                    suspicious: '#d97706',
                    verified: '#0284c7',
                    neural: '#7c3aed',
                },
            },
            boxShadow: {
                glass: '0 4px 20px -2px rgba(15, 23, 42, 0.05), 0 2px 6px -1px rgba(15, 23, 42, 0.03)',
                'glass-hover': '0 10px 30px -4px rgba(15, 23, 42, 0.08), 0 4px 10px -2px rgba(15, 23, 42, 0.04)',
                'glow-emerald': '0 0 25px -4px rgba(16, 185, 129, 0.25)',
                'glow-rose': '0 0 25px -4px rgba(244, 63, 94, 0.25)',
                'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.25)',
                'glow-cyan': '0 0 25px -4px rgba(6, 182, 212, 0.25)',
                'glow-indigo': '0 0 25px -4px rgba(99, 102, 241, 0.25)',
                panel: '0 1px 3px 0 rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
                card: '0 2px 8px -2px rgba(15, 23, 42, 0.06), 0 1px 4px -1px rgba(15, 23, 42, 0.03)',
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-dot': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.4', transform: 'scale(0.85)' },
                },
                'scan-laser': {
                    '0%': { top: '0%', opacity: '0.2' },
                    '50%': { opacity: '0.9' },
                    '100%': { top: '100%', opacity: '0.2' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
                'fade-up-slow': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
                'pulse-dot': 'pulse-dot 1.8s ease-in-out infinite',
                'scan-laser': 'scan-laser 2s ease-in-out infinite',
                shimmer: 'shimmer 2s linear infinite',
            },
            backgroundImage: {
                'brand-gradient': 'linear-gradient(135deg, #0284c7 0%, #4f46e5 50%, #9333ea 100%)',
                'brand-subtle': 'linear-gradient(135deg, rgba(2, 132, 199, 0.06) 0%, rgba(79, 70, 229, 0.06) 50%, rgba(147, 51, 234, 0.06) 100%)',
            },
        },
    },
    plugins: [],
};
