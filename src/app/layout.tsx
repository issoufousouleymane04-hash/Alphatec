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
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
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
        {/* 🎯 Script anti-flash : CLAIR par défaut */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('alpha-tec-theme');

                  // 🎯 RÈGLE :
                  // - Si l'utilisateur a choisi 'dark' → sombre
                  // - Si l'utilisateur a choisi 'system' → suit le système
                  // - Sinon (par défaut, ou 'light') → CLAIR

                  if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (theme === 'system') {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    // 🎯 Par défaut : CLAIR (même si le système est en sombre)
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {
                  document.documentElement.classList.remove('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors theme="light" />
      </body>
    </html>
  )
}