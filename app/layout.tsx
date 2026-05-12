import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import "./globals.css"
import { AuthProvider } from "@/features/auth/context/auth.context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Inventory Management System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <AuthProvider>
        <body className="min-h-full flex flex-col">
          {children}
          <Toaster // ✅ moved inside <body>
            position="top-right"
            richColors
            closeButton
          />
        </body>
      </AuthProvider>
    </html>
  )
}
