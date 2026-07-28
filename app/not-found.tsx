"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
         <img src="/logo.png" alt="Logo" className="h-14" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-semibold tracking-tight">
          Page not found
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The page you're looking for doesn't exist or may have been moved.
          Please check the URL or return to the dashboard.
        </p>

        {/* Actions */}
        <div className="mt-8 flex justify-center gap-3">
          <Button asChild>
            <Link href="/inventory">
              <Home className="mr-2 h-4 w-4" />
              Home
            </Link>
          </Button>

          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}