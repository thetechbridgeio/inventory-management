export const mapSales = (data: any[]) =>
  data.map((item, index) => ({
    srNo: item.srNo || item["Sr. no"] || index + 1,
    product: item.product || item["Product"] || "Unknown Product",
    quantity: Number(item.quantity || item["Quantity"] || 0),
    unit: item.unit || item["Unit"] || "PCS",
    contact: item.contact || item["Contact"] || "",
    companyName: item.companyName || item["Company Name"] || "",
    dateOfIssue:
      item.dateOfIssue ||
      item["Date of Issue"] ||
      new Date().toISOString().split("T")[0],
  }))

export const mapInventory = (data: any[]) =>
  data.map((item, index) => ({
    srNo: item.srNo || item["Sr. no"] || index + 1,
    product: item.product || item["Product"] || "Unknown Product",
    category: item.category || item["Category"] || "Uncategorized",
    unit: item.unit || item["Unit"] || "PCS",
    minimumQuantity: Number(item.minimumQuantity || item["Minimum Quantity"] || 0),
    maximumQuantity: Number(item.maximumQuantity || item["Maximum Quantity"] || 0),
    reorderQuantity: Number(item.reorderQuantity || item["Reorder Quantity"] || 0),
    stock: Number(item.stock || item["Stock"] || 0),
    pricePerUnit: Number(item.pricePerUnit || item["Price per Unit"] || 0),
    value: Number(item.value || item["Value"] || 0),
    productType: item.productType || item["Product Type"] || "",
  }))

export const mapSuppliers = (data: any[]) =>
  data.map((item) => ({
    supplier: item.supplier || item["Supplier"] || "",
    companyName: item.companyName || item["Company Name"] || "",
  }))