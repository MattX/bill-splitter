import { NextResponse } from "next/server"
import { createFriend, getFriends } from "@/lib/db"

export async function GET() {
  try {
    const friends = await getFriends()
    return NextResponse.json(friends)
  } catch (error) {
    console.error("Error fetching friends:", error)
    return NextResponse.json({ error: "Failed to fetch friends" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Friend name is required" }, { status: 400 })
    }

    const friend = await createFriend(name)
    return NextResponse.json(friend)
  } catch (error) {
    console.error("Error creating friend:", error)
    return NextResponse.json({ error: "Failed to create friend" }, { status: 500 })
  }
}
