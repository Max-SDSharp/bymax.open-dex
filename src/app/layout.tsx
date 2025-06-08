import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider, Navbar } from '@/components'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bymax OpenDEX',
  description: 'A decentralized exchange (DEX) interface',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${jetbrainsMono.className} bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-white`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  )
}
