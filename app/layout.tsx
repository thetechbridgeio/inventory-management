import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import { QueryProvider } from "@/lib/query-provider";
import { AuthProvider } from "@/features/auth/providers/use-auth.provider";

import { Toaster } from "sonner";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory Management",
  description: "Inventory Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthProvider>
            <NuqsAdapter>
              <TooltipProvider>{children}</TooltipProvider>
            </NuqsAdapter>
          </AuthProvider>
        </QueryProvider>

        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
