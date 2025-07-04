import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { UserProvider } from '../context/UserContext'
import { CartProvider } from '../context/CartContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '中药材B2B平台',
  description: '专业的中药材批发交易平台',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <UserProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </CartProvider>
        </UserProvider>
      </body>
    </html>
  )
}
