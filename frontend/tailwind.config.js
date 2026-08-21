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
                    'Inter',
                    'ui-sans-serif',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
                mono: [
                    'JetBrains Mono',
                    'ui-monospace',
                    'SFMono-Regular',
                    'Menlo',
                    'monospace',
                ],
            },
            colors: {
                ink: {
                    950: '#04060c',
                    900: '#070b14',
                    800: '#0b1120',
                    700: '#111a2e',
                },
            },
            boxShadow: {
                glow: '0 0 40px -12px rgba(34, 211, 238, 0.35)',
                'glow-rose': '0 0 40px -12px rgba(244, 63, 94, 0.4)',
                panel: '0 8px 32px rgba(0, 0, 0, 0.45)',
            },
            keyframes: {
                'fade-up': {
                    '0%': { opacity: '0', transform: 'translateY(14px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'pulse-dot': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.45', transform: 'scale(0.82)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-400px 0' },
                    '100%': { backgroundPosition: '400px 0' },
                },
            },
            animation: {
                'fade-up': 'fade-up 0.5s ease-out both',
                'fade-up-slow': 'fade-up 0.7s ease-out both',
                'pulse-dot': 'pulse-dot 1.6s ease-in-out infinite',
                shimmer: 'shimmer 1.8s linear infinite',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'brand':
                    'linear-gradient(135deg, #22d3ee 0%, #818cf8 55%, #e879f9 100%)',
            },
        },
    },
    plugins: [],
}
