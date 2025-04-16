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
    // suppressHydrationWarning is used here because next-themes modifies the HTML element's
    // class and style attributes during hydration, which can cause a mismatch between
    // server and client rendering. This is expected behavior and safe to suppress
    // since the theme switching is handled by next-themes.
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          storageKey="bill-splitter-theme"
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
