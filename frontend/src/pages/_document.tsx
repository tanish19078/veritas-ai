import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
    return (
        <Html lang="en" className="scroll-smooth">
            <Head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap"
                    rel="stylesheet"
                />
                <meta name="theme-color" content="#f8fafc" />
                <meta
                    name="description"
                    content="Veritas AI — Next-generation multi-layer deepfake forensics and synthetic media integrity audit suite."
                />
            </Head>
            <body className="bg-slate-50 text-slate-900 antialiased font-sans">
                <Main />
                <NextScript />
            </body>
        </Html>
    );
}
