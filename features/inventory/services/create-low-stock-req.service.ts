// features/inventory/services/create-low-stock-request.service.ts

import { generateLowStockPDF } from "../pdf/generate-low-stock-pdf"

import { GenerateLowStockPDFInput } from "../types/low-stock.types"

export async function createLowStockRequest(input: GenerateLowStockPDFInput) {
  /*
   |--------------------------------------------------------------------------
   | Generate PDF
   |--------------------------------------------------------------------------
   */

  const doc = await generateLowStockPDF(input)

  /*
   |--------------------------------------------------------------------------
   | Blob
   |--------------------------------------------------------------------------
   */

  const pdfBlob = doc.output("blob")

  /*
   |--------------------------------------------------------------------------
   | Download
   |--------------------------------------------------------------------------
   */

  const pdfUrl = URL.createObjectURL(pdfBlob)

  window.open(pdfUrl)

  /*
   |--------------------------------------------------------------------------
   | Future
   |--------------------------------------------------------------------------
   */

  // uploadToStorage(pdfBlob)
  // sendEmail(pdfBlob)
  // sendWhatsApp(pdfBlob)
  // createAuditLog()

  return {
    success: true,
    pdfBlob,
  }
}
