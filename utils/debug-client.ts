/**
 * Utility function to log client data for debugging purposes
 */
export function debugClientData() {
  console.log("=== CLIENT DATA DEBUG ===")

  // Check localStorage
  const storedClient = localStorage.getItem("client")
  console.log("localStorage client:", storedClient ? JSON.parse(storedClient) : "Not found")

  // Check sessionStorage
  const clientId = sessionStorage.getItem("clientId")
  const clientName = sessionStorage.getItem("clientName")
  console.log("sessionStorage clientId:", clientId || "Not found")
  console.log("sessionStorage clientName:", clientName || "Not found")

  // Check cookies
  const cookies = document.cookie.split(";").reduce(
    (acc, cookie) => {
      const [key, value] = cookie.trim().split("=")
      acc[key] = value
      return acc
    },
    {} as Record<string, string>,
  )

  console.log("cookies clientId:", cookies.clientId || "Not found")

  console.log("=== END CLIENT DATA DEBUG ===")

  return {
    localStorage: storedClient ? JSON.parse(storedClient) : null,
    sessionStorage: { clientId, clientName },
    cookies: { clientId: cookies.clientId },
  }
}
