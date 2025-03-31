declare module "jspdf-autotable" {
  import type { jsPDF } from "jspdf"

  interface UserOptions {
    head?: any[][]
    body?: any[][]
    foot?: any[][]
    startY?: number
    margin?: any
    theme?: string
    styles?: any
    headStyles?: any
    bodyStyles?: any
    footStyles?: any
    didDrawPage?: (data: any) => void
    willDrawCell?: (data: any) => void
    didDrawCell?: (data: any) => void
    didParseCell?: (data: any) => void
    [key: string]: any
  }

  function autoTable(doc: jsPDF, options: UserOptions): jsPDF

  export default autoTable
}

