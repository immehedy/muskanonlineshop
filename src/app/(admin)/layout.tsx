import { Inter } from 'next/font/google';
import '../globals.css';
import { Header } from './admin/components/Header';
import { Sidebar } from './admin/components/Sidebar';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-100">
          <div className="flex">
            <Sidebar />
            <div className="flex-1 flex flex-col">
              <Header />
              <main className="flex-1 p-6">
                {children}
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}