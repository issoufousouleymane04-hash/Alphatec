import type { Metadata } from 'next'
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}