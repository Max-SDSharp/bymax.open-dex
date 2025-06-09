import type { Metadata } from 'next'
import { JetBrains_Mono } from 'next/font/google'

import './globals.css'
import { ThemeProvider, Navbar } from '@/components'
import Footer from '@/components/ui/footer/footer'

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Bymax OpenDEX',
  description: 'A decentralized exchange (DEX) interface',
  icons: {
    icon: '/favicon.ico',
  },
  openGraph: {
    title: 'Bymax OpenDEX',
    description:
      'Trade Bitcoin, Ethereum and more on a decentralized exchange (DEX) with security and performance.',
    url: 'https://dex.bymax.trade',
    siteName: 'Bymax OpenDEX',
    images: [
      {
        url: '/opendex-og.png',
        width: 1200,
        height: 630,
        alt: 'Bymax OpenDEX',
      },
    ],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bymax OpenDEX',
    description:
      'Trade Bitcoin, Ethereum and more on a decentralized exchange (DEX) with security and performance.',
    site: '@bymaxtrade',
    creator: '@bymaxtrade',
    images: ['/opendex-og.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#101010" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
        <meta
          name="keywords"
          content="DEX, Exchange, Bitcoin, Ethereum, Crypto, Trading, Bymax"
        />
      </head>
      <body
        className={`${jetbrainsMono.className} bg-gray-25 text-gray-900 dark:bg-gray-900 dark:text-white`}
      >
        <ThemeProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  )
}
