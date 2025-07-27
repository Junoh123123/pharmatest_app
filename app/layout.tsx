import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '薬学部定期試験学習アプリ',
  description: '定期試験の虫食い問題を効率的に学習できるインタラクティブなWebアプリケーション',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
