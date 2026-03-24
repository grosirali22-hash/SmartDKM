import type { Metadata } from 'next'
import './globals.css'
import Navbar from './components/Navbar'
import { GlobalProvider } from './context/GlobalContext'
import AdzanWatcher from './components/AdzanWatcher'
import MainLayoutWrapper from './components/MainLayoutWrapper'

import { ThemeProvider } from './components/ThemeProvider'
import { Plus_Jakarta_Sans } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jakarta',
})

export const metadata: Metadata = {
  title: 'Smart DKM',
  description: 'Sistem Informasi Manajemen DKM Masjid',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart DKM',
  },
}

export const viewport = {
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning className={jakarta.variable}>
      <body className="font-sans bg-background text-foreground min-h-screen antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <GlobalProvider>
            {/* Sidebar Navigasi */}
            <Navbar />

            {/* Konten Utama */}
            <MainLayoutWrapper>
              {children}
            </MainLayoutWrapper>

            {/* Adzan Overlay — aktif otomatis saat waktu shalat */}
            <AdzanWatcher />
          </GlobalProvider>
        </ThemeProvider>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                      console.log('ServiceWorker registration failed: ', err);
                    }
                  );
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}

