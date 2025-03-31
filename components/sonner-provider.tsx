"use client"

import { Toaster as SonnerToaster } from "sonner"

export function SonnerProvider() {
  return (
    <SonnerToaster 
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        className: "border border-border",
      }}
    />
  )
}