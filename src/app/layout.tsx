import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Alpha-Tec — Gestion',
  description: 'Système de gestion Alpha-Tec',
  icons: {
    icon: '/logo/alpha-tec-icon.png',
    apple: '/logo/alpha-tec-icon.png',
    shortcut: '/logo/alpha-tec-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1e3c72' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0f0f' },
  ],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        {/* 🎯 Script anti-flash : applique le thème AVANT le rendu */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('alpha-tec-theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                  // Par défaut : suit le système
                  if (theme === 'dark' || (theme === 'system' && prefersDark) || (!theme && prefersDark)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors theme="system" />
      </body>
    </html>
  )
}