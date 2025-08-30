import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { ThemeProvider } from "@/components/theme-provider"
import { Providers } from "./providers"
import { Toaster } from "sonner"
import "./globals.css"

export const metadata: Metadata = {
  title: "Aimentions.app - AI Keyword Mention Tool",
  description:
    "The first AI-powered keyword mention tool. Analyze keyword volume and brand mentions using ChatGPT and other LLMs.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <body className="font-sans" suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>
            {children}
          </Providers>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
