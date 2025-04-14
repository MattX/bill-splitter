import { NextResponse } from "next/server"
import { createFriend, getFriends, deleteFriend } from "@/lib/db"

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

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Friend ID is required" }, { status: 400 })
    }

    await deleteFriend(Number.parseInt(id))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting friend:", error)
    return NextResponse.json({ error: "Failed to delete friend" }, { status: 500 })
  }
}
