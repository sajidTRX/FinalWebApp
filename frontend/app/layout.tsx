import type { Metadata } from 'next'
import './globals.css'
import { FontThemeInitializer } from '@/components/FontThemeInitializer'
import { EditorSettingsProvider } from '@/lib/editor-settings-context'
import { KeyboardShortcutsProvider } from '@/components/KeyboardShortcutsProvider'
import { WifiProvider } from '@/lib/wifi-context'
import { WifiStatusIcon } from '@/components/WifiStatusIcon'

export const metadata: Metadata = {
  title: 'Tagore',
  description: 'A modern writing application',
  generator: 'Tagore.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>
        <FontThemeInitializer />
        <EditorSettingsProvider>
          <KeyboardShortcutsProvider>
            <WifiProvider>
              <WifiStatusIcon />
              {children}
            </WifiProvider>
          </KeyboardShortcutsProvider>
        </EditorSettingsProvider>
      </body>
    </html>
  )
}
