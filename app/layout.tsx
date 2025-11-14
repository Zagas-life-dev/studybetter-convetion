import type React from "react"
import type { Metadata } from "next"
import { Lexend } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const lexend = Lexend({ 
  subsets: ["latin"],
  // Include multiple weights for better typography
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-lexend',
})

export const metadata: Metadata = {
  title: {
    default: "Study Better - AI-Powered PDF Learning Platform",
    template: "%s | Study Better"
  },
  description: "Transform your PDF documents into powerful learning resources with AI-powered summaries, detailed explanations, and perfect mathematical expression rendering. Ideal for students, researchers, and lifelong learners.",
  keywords: [
    "PDF summarizer",
    "AI PDF analysis",
    "document summarization",
    "PDF to markdown",
    "academic PDF tool",
    "study assistant",
    "PDF explanation tool",
    "mathematical PDF processing",
    "LaTeX PDF rendering",
    "educational technology"
  ],
  authors: [{ name: "Study Better" }],
  creator: "Study Better",
  publisher: "Study Better",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://studybetter.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Study Better - AI-Powered PDF Learning Platform',
    description: 'Transform your PDF documents into powerful learning resources with AI-powered summaries and explanations.',
    siteName: 'Study Better',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Study Better - AI-Powered PDF Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Study Better - AI-Powered PDF Learning Platform',
    description: 'Transform your PDF documents into powerful learning resources with AI-powered summaries and explanations.',
    images: ['/og-image.png'],
    creator: '@studybetter',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION,
    yandex: process.env.YANDEX_VERIFICATION,
  },
  category: 'education',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add KaTeX CSS from CDN */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Study Better",
              "description": "AI-powered PDF learning platform that transforms documents into powerful learning resources",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://studybetter.com",
              "applicationCategory": "EducationalApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "150"
              },
              "featureList": [
                "AI-powered PDF summarization",
                "Detailed document explanations",
                "Mathematical expression rendering",
                "LaTeX support",
                "Interactive PDF generation"
              ]
            })
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Study Better",
              "url": process.env.NEXT_PUBLIC_SITE_URL || "https://studybetter.com",
              "logo": `${process.env.NEXT_PUBLIC_SITE_URL || "https://studybetter.com"}/logo.png`,
              "sameAs": [
                "https://twitter.com/studybetter",
                "https://linkedin.com/company/studybetter"
              ]
            })
          }}
        />
      </head>
      <body className={`${lexend.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="light" 
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
