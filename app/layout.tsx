import type { Metadata } from 'next'
import './globals.css'
import { siteConfig } from '@/lib/siteConfig' // 👈 불러오기

export const metadata: Metadata = {
  title: siteConfig.title, // 👈 변수로 변경
  description: siteConfig.description, // 👈 변수로 변경
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="antialiased">{children}</body>
    </html>
  )
}