import { deleteCookie } from "cookies-next"

/**
 * Clears all client-related data from storage
 */
export function clearClientData() {
  // Clear session storage
  sessionStorage.removeItem("isLoggedIn")
  sessionStorage.removeItem("userRole")
  sessionStorage.removeItem("clientId")
  sessionStorage.removeItem("clientName")

  // Clear local storage
  localStorage.removeItem("client")
  localStorage.removeItem("inventory-filters")
  localStorage.removeItem("purchase-filters")
  localStorage.removeItem("sales-filters")

  // Clear cookies
  deleteCookie("clientId")

  // Log the clearing operation
  console.log("All client data cleared")
}
