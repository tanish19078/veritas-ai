import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { Inter, JetBrains_Mono } from 'next/font/google';

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-sans',
    display: 'swap',
    weight: ['300', '400', '500', '600', '700', '800', '900'],
});

const jetbrainsMono = JetBrains_Mono({
    subsets: ['latin'],
    variable: '--font-mono',
    display: 'swap',
    weight: ['400', '500', '600', '700', '800'],
});

export default function App({ Component, pageProps }: AppProps) {
    return (
        <div className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
            <Component {...pageProps} />
        </div>
    );
}
