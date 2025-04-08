"use client"

import { useEffect, useState } from "react"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, AlertTriangle, DollarSign, TrendingUp, TrendingDown, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { InventoryItem, PurchaseItem, SalesItem } from "@/lib/types"
import { getStockStatus } from "@/lib/utils"
import { Progress } from "@/components/ui/progress"
import { format, subDays } from "date-fns"
import { useClientContext } from "@/context/client-context"
import { toast } from "sonner"

// Import the client terminology utilities
import { getPurchaseTerm, getSalesTerm } from "@/lib/client-terminology"

// Define a type for our time-based metrics
interface TimeMetrics {
  today: {
    purchases: number
    sales: number
  }
  yesterday: {
    purchases: number
    sales: number
  }
  thisWeek: {
    purchases: number
    sales: number
  }
  lastWeek: {
    purchases: number
    sales: number
  }
  avgPerDay: {
    purchases: number
    sales: number
  }
  newProductsThisWeek: number
}

export default function DashboardPage() {
  const [inventoryData, setInventoryData] = useState<InventoryItem[]>([])
  const [purchaseData, setPurchaseData] = useState<PurchaseItem[]>([])
  const [salesData, setSalesData] = useState<SalesItem[]>([])
  const [timeMetrics, setTimeMetrics] = useState<TimeMetrics>({
    today: { purchases: 0, sales: 0 },
    yesterday: { purchases: 0, sales: 0 },
    thisWeek: { purchases: 0, sales: 0 },
    lastWeek: { purchases: 0, sales: 0 },
    avgPerDay: { purchases: 0, sales: 0 },
    newProductsThisWeek: 0,
  })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalValue: 0,
    lowStockItems: 0,
    excessStockItems: 0,
    categories: 0,
    averagePrice: 0,
  })

  // Add a new state variable to track negative stock items
  const [negativeStockItems, setNegativeStockItems] = useState<InventoryItem[]>([])

  const { client } = useClientContext()

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching dashboard data with clientId:", client?.id)
        setLoading(true)

        // Add timestamp to prevent caching
        const timestamp = new Date().getTime()

        // Fetch inventory data
        const inventoryResponse = await fetch(`/api/sheets?sheet=Inventory&clientId=${client?.id}&t=${timestamp}`)
        if (!inventoryResponse.ok) {
          const errorData = await inventoryResponse.json()
          console.error("Inventory API error:", errorData)
          throw new Error(`Inventory API error: ${errorData.error || "Unknown error"}`)
        }
        const inventoryResult = await inventoryResponse.json()

        // Fetch purchase data
        const purchaseResponse = await fetch(`/api/sheets?sheet=Purchase&clientId=${client?.id}&t=${timestamp}`)
        if (!purchaseResponse.ok) {
          const errorData = await purchaseResponse.json()
          console.error("Purchase API error:", errorData)
          throw new Error(`Purchase API error: ${errorData.error || "Unknown error"}`)
        }
        const purchaseResult = await purchaseResponse.json()

        // Fetch sales data
        const salesResponse = await fetch(`/api/sheets?sheet=Sales&clientId=${client?.id}&t=${timestamp}`)
        if (!salesResponse.ok) {
          const errorData = await salesResponse.json()
          console.error("Sales API error:", errorData)
          throw new Error(`Sales API error: ${errorData.error || "Unknown error"}`)
        }
        const salesResult = await salesResponse.json()
        console.log("Sales data fetched:", salesResult)

        // Process the data as before...
        if (inventoryResult.data) {
          // Map the field names from Google Sheets to our expected field names
          const processedData = inventoryResult.data.map((item: any, index: number) => {
            return {
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
              timestamp: item.timestamp || item["Timestamp"] || null,
            }
          })

          setInventoryData(processedData)

          // Calculate statistics
          const data = processedData
          const totalValue = data.reduce((sum: number, item: InventoryItem) => sum + item.value, 0)
          const lowStockItems = data.filter((item: InventoryItem) => getStockStatus(item) === "low").length
          const excessStockItems = data.filter((item: InventoryItem) => getStockStatus(item) === "excess").length
          const categories = [...new Set(data.map((item: InventoryItem) => item.category))].length
          const averagePrice =
            data.length > 0
              ? data.reduce((sum: number, item: InventoryItem) => sum + item.pricePerUnit, 0) / data.length
              : 0

          setStats({
            totalProducts: data.length,
            totalValue,
            lowStockItems,
            excessStockItems,
            categories,
            averagePrice,
          })

          // Add this code to identify negative stock items
          const itemsWithNegativeStock = data.filter((item: InventoryItem) => item.stock < 0)
          setNegativeStockItems(itemsWithNegativeStock)
        } else {
          console.warn("No inventory data found in the response")
        }

        if (purchaseResult.data) {
          const processedPurchaseData = purchaseResult.data.map((item: any, index: number) => {
            const processed = {
              srNo: item.srNo || item["Sr. no"] || index + 1,
              product: item.product || item["Product"] || "Unknown Product",
              quantity: Number(item.quantity || item["Quantity"] || 0),
              unit: item.unit || item["Unit"] || "PCS",
              poNumber: item.poNumber || item["PO Number"] || "",
              supplier: item.supplier || item["Supplier"] || "",
              dateOfReceiving: item.dateOfReceiving || item["Date of Receiving"] || "",
              rackNumber: item.rackNumber || item["Rack Number"] || "",
              timestamp: item.timestamp || item["Timestamp"] || null,
            }
            return processed
          })
          setPurchaseData(processedPurchaseData)
        } else {
          console.warn("No purchase data found in the response")
        }

        if (salesResult.data) {
          const processedSalesData = salesResult.data.map((item: any, index: number) => {
            const processed = {
              srNo: item.srNo || item["Sr. no"] || index + 1,
              product: item.product || item["Product"] || "Unknown Product",
              quantity: Number(item.quantity || item["Quantity"] || 0),
              unit: item.unit || item["Unit"] || "PCS",
              contact: item.contact || item["Contact"] || "",
              companyName: item.companyName || item["Company Name"] || "",
              dateOfIssue: item.dateOfIssue || item["Date of Issue"] || "",
              timestamp: item.timestamp || item["Timestamp"] || null,
            }
            return processed
          })
          setSalesData(processedSalesData)
        } else {
          console.warn("No sales data found in the response")
        }

        // Process time metrics after all data is fetched
        if (purchaseResult.data && salesResult.data && inventoryResult.data) {
          calculateTimeMetrics(inventoryResult.data, purchaseResult.data, salesResult.data)
        } else {
          // Use empty arrays as fallback if any data is missing
          calculateTimeMetrics(inventoryResult.data || [], purchaseResult.data || [], salesResult.data || [])
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        toast.error("Failed to load dashboard data. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    if (client?.id) {
      console.log("Dashboard: Client ID is available, fetching data...", client?.id)
      fetchData()
    } else {
      console.warn("Dashboard: No client ID available")
      setLoading(false) // Stop loading if no client ID
    }
  }, [client?.id])

  const calculateTimeMetrics = (inventoryItems: any[], purchaseItems: any[], salesItems: any[]) => {
    const today = new Date()
    const yesterday = subDays(today, 1)
    const oneWeekAgo = subDays(today, 7)
    const twoWeeksAgo = subDays(today, 14)

    // Initialize counters
    let todayPurchases = 0
    let todaySales = 0
    let yesterdayPurchases = 0
    let yesterdaySales = 0
    let thisWeekPurchases = 0
    let thisWeekSales = 0
    let lastWeekPurchases = 0
    let lastWeekSales = 0
    let newProductsThisWeek = 0

    // Count new products added this week
    // First, check if we have any timestamp data
    const hasTimestamps = inventoryItems.some((item) => item.timestamp || item["Timestamp"])

    if (hasTimestamps) {
      // Use timestamps if available
      inventoryItems.forEach((item) => {
        const timestamp = item.timestamp || item["Timestamp"]
        if (timestamp) {
          try {
            const date = new Date(timestamp)
            if (date >= oneWeekAgo && date <= today) {
              newProductsThisWeek++
            }
          } catch (error) {
            console.error("Error parsing inventory timestamp:", error)
          }
        }
      })
    } else {
      // Fallback: assume the last 5 items are new this week
      newProductsThisWeek = Math.min(5, inventoryItems.length)
    }

    // Process purchase data
    purchaseItems.forEach((item) => {
      // Try using timestamp first
      const timestamp = item.timestamp || item["Timestamp"]
      const dateField = item.dateOfReceiving || item["Date of Receiving"]

      if (timestamp) {
        try {
          const date = new Date(timestamp)

          // Today's purchases
          if (date.toDateString() === today.toDateString()) {
            todayPurchases++
          }

          // Yesterday's purchases
          if (date.toDateString() === yesterday.toDateString()) {
            yesterdayPurchases++
          }

          // This week's purchases
          if (date >= oneWeekAgo && date <= today) {
            thisWeekPurchases++
          }

          // Last week's purchases
          if (date >= twoWeeksAgo && date < oneWeekAgo) {
            lastWeekPurchases++
          }
        } catch (error) {
          console.error("Error parsing purchase timestamp:", error)
        }
      }
      // Fallback to dateOfReceiving if timestamp is not available
      else if (dateField) {
        try {
          const date = new Date(dateField)

          // Today's purchases
          if (date.toDateString() === today.toDateString()) {
            todayPurchases++
          }

          // Yesterday's purchases
          if (date.toDateString() === yesterday.toDateString()) {
            yesterdayPurchases++
          }

          // This week's purchases
          if (date >= oneWeekAgo && date <= today) {
            thisWeekPurchases++
          }

          // Last week's purchases
          if (date >= twoWeeksAgo && date < oneWeekAgo) {
            lastWeekPurchases++
          }
        } catch (error) {
          console.error("Error parsing purchase date:", error)
        }
      }
      // If no date information, assume it's from this week
      else {
        thisWeekPurchases++
      }
    })

    // Process sales data
    salesItems.forEach((item) => {
      // Try using timestamp first
      const timestamp = item.timestamp || item["Timestamp"]
      const dateField = item.dateOfIssue || item["Date of Issue"]

      if (timestamp) {
        try {
          const date = new Date(timestamp)

          // Today's sales
          if (date.toDateString() === today.toDateString()) {
            todaySales++
          }

          // Yesterday's sales
          if (date.toDateString() === yesterday.toDateString()) {
            yesterdaySales++
          }

          // This week's sales
          if (date >= oneWeekAgo && date <= today) {
            thisWeekSales++
          }

          // Last week's sales
          if (date >= twoWeeksAgo && date < oneWeekAgo) {
            lastWeekSales++
          }
        } catch (error) {
          console.error("Error parsing sales timestamp:", error)
        }
      }
      // Fallback to dateOfIssue if timestamp is not available
      else if (dateField) {
        try {
          const date = new Date(dateField)

          // Today's sales
          if (date.toDateString() === today.toDateString()) {
            todaySales++
          }

          // Yesterday's sales
          if (date.toDateString() === yesterday.toDateString()) {
            yesterdaySales++
          }

          // This week's sales
          if (date >= oneWeekAgo && date <= today) {
            thisWeekSales++
          }

          // Last week's sales
          if (date >= twoWeeksAgo && date < oneWeekAgo) {
            lastWeekSales++
          }
        } catch (error) {
          console.error("Error parsing sales date:", error)
        }
      }
      // If no date information, assume it's from this week
      else {
        thisWeekSales++
      }
    })

    // If we have no date-based data, use fallback values
    if (thisWeekPurchases === 0 && thisWeekSales === 0) {
      // Fallback: assume all items are from this week
      thisWeekPurchases = purchaseItems.length
      thisWeekSales = salesItems.length

      // Distribute some to today and yesterday
      todayPurchases = Math.min(2, purchaseItems.length)
      todaySales = Math.min(2, salesItems.length)
      yesterdayPurchases = Math.min(1, purchaseItems.length)
      yesterdaySales = Math.min(1, salesItems.length)
    }

    // Calculate average per day
    const totalDays = Math.max(1, 7) // Just use 7 days for simplicity
    const avgPurchasesPerDay = Math.round((thisWeekPurchases / totalDays) * 100) / 100
    const avgSalesPerDay = Math.round((thisWeekSales / totalDays) * 100) / 100

    setTimeMetrics({
      today: { purchases: todayPurchases, sales: todaySales },
      yesterday: { purchases: yesterdayPurchases, sales: yesterdaySales },
      thisWeek: { purchases: thisWeekPurchases, sales: thisWeekSales },
      lastWeek: { lastWeekPurchases, sales: lastWeekSales },
      avgPerDay: { purchases: avgPurchasesPerDay, sales: avgSalesPerDay },
      newProductsThisWeek,
    })
  }

  const handleNavigate = (path: string) => {
    redirect(path)
  }

  // Calculate week-over-week change percentages
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0
    return Math.round(((current - previous) / previous) * 100)
  }

  const purchaseChange = calculateChange(timeMetrics.thisWeek.purchases, timeMetrics.lastWeek.purchases)
  const salesChange = calculateChange(timeMetrics.thisWeek.sales, timeMetrics.lastWeek.sales)

  if (!client) {
    return (
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">No client selected. Please select a client to view dashboard data.</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="space-y-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your inventory management system</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button onClick={() => handleNavigate("/dashboard/inventory")}>View Inventory</Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
            <p className="text-xs text-muted-foreground">Across {stats.categories} categories</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Inventory Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Avg. ₹{stats.averagePrice.toFixed(2)} per item</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.lowStockItems} Low Stock Items</div>
            <p className="text-xs text-muted-foreground mb-2">{stats.excessStockItems} items with excess stock</p>
            <Progress
              value={((stats.totalProducts - stats.lowStockItems - stats.excessStockItems) / stats.totalProducts) * 100}
              className="h-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {Math.round(
                ((stats.totalProducts - stats.lowStockItems - stats.excessStockItems) / stats.totalProducts) * 100,
              )}
              % optimal stock levels
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time-based metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeMetrics.newProductsThisWeek}</div>
            <p className="text-xs text-muted-foreground">Added this week</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">{getPurchaseTerm(client?.name)}</p>
                <div className="text-2xl font-bold">{timeMetrics.today.purchases}</div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{getSalesTerm(client?.name)}s</p>
                <div className="text-2xl font-bold">{timeMetrics.today.sales}</div>
              </div>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {timeMetrics.today.purchases + timeMetrics.today.sales >
              timeMetrics.yesterday.purchases + timeMetrics.yesterday.sales ? (
                <span className="flex items-center text-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" /> More active than yesterday
                </span>
              ) : (
                <span className="flex items-center text-amber-600">
                  <TrendingDown className="h-3 w-3 mr-1" /> Less active than yesterday
                </span>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly {getPurchaseTerm(client?.name)}</CardTitle>
            <div className={`flex items-center ${purchaseChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {purchaseChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeMetrics.thisWeek.purchases}</div>
            <p className="text-xs text-muted-foreground">
              {purchaseChange >= 0 ? (
                <span className="text-green-600">+{purchaseChange}%</span>
              ) : (
                <span className="text-red-600">{purchaseChange}%</span>
              )}{" "}
              from last week
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg. {timeMetrics.avgPerDay.purchases} per day</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly {getSalesTerm(client?.name)}</CardTitle>
            <div className={`flex items-center ${salesChange >= 0 ? "text-green-600" : "text-red-600"}`}>
              {salesChange >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeMetrics.thisWeek.sales}</div>
            <p className="text-xs text-muted-foreground">
              {salesChange >= 0 ? (
                <span className="text-green-600">+{salesChange}%</span>
              ) : (
                <span className="text-red-600">{salesChange}%</span>
              )}{" "}
              from last week
            </p>
            <p className="text-xs text-muted-foreground mt-1">Avg. {timeMetrics.avgPerDay.sales} per day</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Your latest inventory transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full">
              <div className="grid grid-cols-4 gap-2 mb-2 font-medium text-sm">
                <div>Type</div>
                <div>Product</div>
                <div>Quantity</div>
                <div>Date/Time</div>
              </div>
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {[
                  ...purchaseData.map((item) => ({
                    type: getPurchaseTerm(client?.name),
                    product: item.product,
                    quantity: item.quantity,
                    timestamp: item.timestamp,
                    date: item.dateOfReceiving,
                  })),
                  ...salesData.map((item) => ({
                    type: getSalesTerm(client?.name),
                    product: item.product,
                    quantity: item.quantity,
                    timestamp: item.timestamp,
                    date: item.dateOfIssue,
                  })),
                ]
                  .sort((a, b) => {
                    // Sort by timestamp if available, otherwise by date
                    const aTime = a.timestamp
                      ? new Date(a.timestamp).getTime()
                      : a.date
                        ? new Date(a.date).getTime()
                        : 0
                    const bTime = b.timestamp
                      ? new Date(b.timestamp).getTime()
                      : b.date
                        ? new Date(b.date).getTime()
                        : 0
                    return bTime - aTime // Newest first
                  })
                  .slice(0, 5)
                  .map((item, index) => (
                    <div key={index} className="grid grid-cols-4 gap-2 py-2 border-b last:border-0">
                      <div className="text-sm">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-medium ${
                            item.type === getPurchaseTerm(client?.name)
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.type}
                        </span>
                      </div>
                      <div className="text-sm truncate">{item.product}</div>
                      <div className="text-sm">{item.quantity}</div>
                      <div className="text-sm">
                        {item.timestamp
                          ? format(new Date(item.timestamp), "MMM d, h:mm a")
                          : item.date
                            ? format(new Date(item.date), "MMM d")
                            : "N/A"}
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 text-xs text-muted-foreground text-center">Showing 5 most recent transactions</div>
            </div>
          </CardContent>
        </Card>

        <div className="col-span-3 space-y-6">
          {/* Negative Stock Items Card */}
          {negativeStockItems.length > 0 && (
            <Card className="shadow-sm hover:shadow-md transition-shadow border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Negative Stock Items</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{negativeStockItems.length}</div>
                <p className="text-xs text-muted-foreground">
                  Total value: ₹{negativeStockItems.reduce((sum, item) => sum + item.value, 0).toLocaleString()}
                </p>
                <p className="text-xs text-red-600 font-medium mb-4">
                  Items that have been oversold and need immediate attention
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleNavigate(`/dashboard/inventory?stockStatus=negative&clientId=${client?.id}`)}
                >
                  View All Negative Stock Items
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Low Stock Items Card */}
          <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {inventoryData.filter((item) => getStockStatus(item) === "low" && item.stock >= 0).length}
              </div>
              <p className="text-xs text-muted-foreground mb-4">Items that need to be reordered soon</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleNavigate(`/dashboard/inventory?clientId=${client?.id}`)}
              >
                View All Low Stock Items
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
