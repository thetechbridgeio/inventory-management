export async function getClients() {
  const res = await fetch("/api/clients")
  if (!res.ok) throw new Error("Failed to fetch clients")
  return res.json()
}

export async function createClient(data: any) {
  const res = await fetch("/api/clients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client: data }),
  })

  const json = await res.json()
  if (!res.ok) throw new Error(json.error)

  return json.client
}