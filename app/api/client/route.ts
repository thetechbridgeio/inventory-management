import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const clientId = searchParams.get("id")

  // In a real application, you would fetch client-specific data from a database
  // For demo purposes, we'll return mock data

  // Default client
  let clientData = {
    id: "default",
    name: "Default Client",
    logo: "/images/default-logo.png?height=80&width=80",
    credentials: {
      username: "Admin",
      password: "admin@123",
    },
  }

  // Client-specific data
  if (clientId === "client1") {
    clientData = {
      id: "client1",
      name: "Client One",
      logo: "/images/default-logo.png?height=80&width=80",
      credentials: {
        username: "ClientOne",
        password: "client1@123",
      },
    }
  } else if (clientId === "client2") {
    clientData = {
      id: "client2",
      name: "Client Two",
      logo: "/images/default-logo.png?height=80&width=80",
      credentials: {
        username: "ClientTwo",
        password: "client2@123",
      },
    }
  }

  return NextResponse.json({ data: clientData })
}

