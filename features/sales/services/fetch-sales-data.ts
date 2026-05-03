import { sortByDateDesc } from "../utils/sort-date-desc"

export async function fetchSalesPageData(clientId?: string) {
  const query = clientId ? `&clientId=${clientId}` : ""

  const [salesRes, inventoryRes, supplierRes] = await Promise.all([
    fetch(`/api/sheets?sheet=Sales${query}`),
    fetch(`/api/sheets?sheet=Inventory${query}`),
    fetch(`/api/sheets?sheet=Suppliers${query}`),
  ])

  const [salesJson, inventoryJson, supplierJson] = await Promise.all([
    salesRes.json(),
    inventoryRes.json(),
    supplierRes.json(),
  ])

  return {
    sales: salesJson.data || [],
    inventory: inventoryJson.data || [],
    suppliers: supplierJson.data || [],
  }
}