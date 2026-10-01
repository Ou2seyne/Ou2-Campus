import type { Metadata, Viewport } from 'next';
import { Bricolage_Grotesque, Geist_Mono } from 'next/font/google';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
  preload: true,
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F5F3EE' },
    { media: '(prefers-color-scheme: dark)',  color: '#0F0F0E' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content',
};

export const metadata: Metadata = {
  title: 'Aura Campus — Emploi du temps ADE',
  description:
    "Cockpit académique instantané et hors-ligne pour les étudiants de l'Université d'Artois — ADE Campus iCal.",
  applicationName: 'Aura Campus',
  manifest: '/manifest.webmanifest',
  keywords: ['emploi du temps', 'ADE Campus', 'Université Artois', 'planning', 'cours'],
  authors: [{ name: 'Aura Campus' }],
  appleWebApp: {
    capable: true,
    title: 'Aura Campus',
    statusBarStyle: 'black-translucent',
    startupImage: [
      {
        url: '/icons/icon-512.png',
      },
    ],
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icons/icon.svg',    type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${bricolage.variable} ${geistMono.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var m=localStorage.getItem('aura_theme')||'auto';var d=m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var el=document.documentElement;if(d){el.classList.add('dark');el.classList.remove('light');el.setAttribute('data-theme','dark');el.style.colorScheme='dark';}else{el.classList.add('light');el.classList.remove('dark');el.setAttribute('data-theme','light');el.style.colorScheme='light';}}catch(e){}})();`,
          }}
        />
      </head>
      <body
        className="min-h-full flex flex-col antialiased overscroll-contain"
        style={{
          fontFamily: 'var(--font-sans), system-ui, sans-serif',
          backgroundColor: 'var(--bg)',
          color: 'var(--text)',
        }}
        suppressHydrationWarning
      >
        <a href="#main-content" className="skip-to-content">
          Aller au contenu principal
        </a>
        {children}
      </body>
    </html>
  );
}
