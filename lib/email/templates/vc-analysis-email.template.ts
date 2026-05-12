import { Inventory } from "@/features/inventory/types/inventory.types"

interface VCAnalysisTemplateProps {
  companyName: string

  hvhv: Inventory[]
  hvlv: Inventory[]
  lvhv: Inventory[]
  lvlv: Inventory[]
}

const generateRows = (products: Inventory[]) => {
  return products
    .slice(0, 10)
    .map(
      (item) => `
      <tr>
        <td>${item.product}</td>
        <td>${item.stock}</td>
        <td>₹${item.value}</td>
      </tr>
    `
    )
    .join("")
}

export const vcAnalysisTemplate = ({
  companyName,
  hvhv,
  hvlv,
  lvhv,
  lvlv,
}: VCAnalysisTemplateProps) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial;
            background: #f4f7fb;
            padding: 32px;
          }

          .container {
            max-width: 900px;
            margin: auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
          }

          .header {
            background: linear-gradient(
              135deg,
              #2563eb,
              #7c3aed
            );

            color: white;
            padding: 32px;
          }

          .content {
            padding: 32px;
          }

          .card {
            margin-bottom: 28px;
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            overflow: hidden;
          }

          .card-header {
            padding: 14px 18px;
            font-weight: bold;
            background: #f9fafb;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          td, th {
            padding: 12px;
            border-top: 1px solid #e5e7eb;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }
        </style>
      </head>

      <body>
        <div class="container">

          <div class="header">
            <h1>Monthly VC Analysis</h1>

            <p>
              ${companyName}
            </p>
          </div>

          <div class="content">

            <div class="card">
              <div class="card-header">
                High Value - High Volume (${hvhv.length})
              </div>

              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Stock</th>
                    <th>Value</th>
                  </tr>
                </thead>

                <tbody>
                  ${generateRows(hvhv)}
                </tbody>
              </table>
            </div>

            <div class="card">
              <div class="card-header">
                High Value - Low Volume (${hvlv.length})
              </div>

              <table>
                <tbody>
                  ${generateRows(hvlv)}
                </tbody>
              </table>
            </div>

            <div class="card">
              <div class="card-header">
                Low Value - High Volume (${lvhv.length})
              </div>

              <table>
                <tbody>
                  ${generateRows(lvhv)}
                </tbody>
              </table>
            </div>

            <div class="card">
              <div class="card-header">
                Low Value - Low Volume (${lvlv.length})
              </div>

              <table>
                <tbody>
                  ${generateRows(lvlv)}
                </tbody>
              </table>
            </div>

          </div>
        </div>
      </body>
    </html>
  `
}
