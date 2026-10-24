import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Caption AI — Social Captions for Medical & Dental Practices',
    template: '%s | Caption AI',
  },
  description:
    'Turn everyday clinic updates and medical insights into authentic social media captions, written in your voice and ready for Instagram and Facebook.',
  keywords: ['dental social media', 'medical marketing', 'AI captions', 'healthcare social media', 'dental marketing'],
  authors: [{ name: 'Caption AI' }],
  creator: 'Caption AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    title: 'Caption AI — Social Captions for Medical & Dental Practices',
    description: 'Your practice. Your voice. Your next post.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Caption AI',
    description: 'AI-powered social media captions for healthcare practices.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
