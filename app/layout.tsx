import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SignageCrash Replay',
  description: 'AI-powered crash timeline reconstruction for digital signage devices',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        <nav className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
          <a href="/" className="text-lg font-semibold tracking-tight text-white">
            SignageCrash<span className="text-violet-400"> Replay</span>
          </a>
          <div className="flex items-center gap-6 text-sm">
            <a href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Dashboard
            </a>
            <a
              href="/crashes/new"
              className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-1.5 rounded-md transition-colors"
            >
              Report Crash
            </a>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}
