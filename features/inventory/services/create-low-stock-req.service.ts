// features/inventory/services/create-low-stock-request.service.ts

import { generateLowStockPDF } from "../pdf/generate-low-stock-pdf"

import { GenerateLowStockPDFInput } from "../types/low-stock.types"

export async function createLowStockRequest(input: GenerateLowStockPDFInput) {
  const doc = await generateLowStockPDF(input)

  const pdfBlob = doc.output("blob")

  const pdfUrl = URL.createObjectURL(pdfBlob)

  window.open(pdfUrl)

  // uploadToStorage(pdfBlob)
  // sendEmail(pdfBlob)
  // sendWhatsApp(pdfBlob)
  // createAuditLog()

  return {
    success: true,
    pdfBlob,
  }
}
