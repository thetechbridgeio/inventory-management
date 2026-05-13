// features/inventory/services/low-stock-request.service.ts

import { saveAs } from "file-saver"

import { generateLowStockPDF } from "../pdf/generate-low-stock-pdf"

import { GenerateLowStockPDFInput } from "../types/low-stock.types"

export async function createLowStockRequestPDF(
  input: GenerateLowStockPDFInput
) {
  const doc = await generateLowStockPDF(input)

  const pdfBlob = doc.output("blob")

  saveAs(pdfBlob, `low-stock-request-${input.requestId}.pdf`)

  return pdfBlob
}
