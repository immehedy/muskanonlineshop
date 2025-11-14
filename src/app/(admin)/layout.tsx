'use client'
import { Inter } from 'next/font/google'
import '../globals.css'
import { Header } from './admin/components/Header'
import { Sidebar } from './admin/components/Sidebar'
import { useAuth } from '@/lib/useAuth'

const inter = Inter({ subsets: ['latin'] })

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated } = useAuth()

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </body>
      </html>
    )
  }

  // Show redirecting message (useAuth will handle the redirect)
  if (!isAuthenticated) {
    return (
      <html lang="en">
        <body className={inter.className}>
          <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <p>Redirecting to login...</p>
          </div>
        </body>
      </html>
    )
  }

  // Show admin layout only if authenticated
  return (
    <html lang="en">
      <body className={inter.className}>
      <div className="flex min-h-screen overflow-hidden">
  <Sidebar />
  <div className="flex flex-col flex-1 min-w-0">
    <Header />
    <main className="p-6 overflow-auto">
      {children}
    </main>
  </div>
</div>

      </body>
    </html>
  )
}