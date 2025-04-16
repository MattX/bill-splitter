import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ReceiptProvider } from '@/components/receipt-context'
import { Toaster } from '@/components/ui/toaster'

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ReceiptProvider>
            {children}
            <Toaster />
          </ReceiptProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
