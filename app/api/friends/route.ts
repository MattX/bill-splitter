import { NextResponse } from "next/server"
import { createFriend, getFriends, deleteFriend } from "@/lib/mongodb-db"

export async function POST(request: Request) {
  try {
    const { name, receiptId } = await request.json()

    if (!name) {
      return NextResponse.json({ error: "Friend name is required" }, { status: 400 })
    }

    const friend = await createFriend(name, receiptId)
    return NextResponse.json(friend)
  } catch (error) {
    console.error("Error creating friend:", error)
    return NextResponse.json({ error: "Failed to create friend" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const name = searchParams.get("name")
    const receiptId = searchParams.get("receiptId")

    if (!name) {
      return NextResponse.json({ error: "Friend name is required" }, { status: 400 })
    }

    if (!receiptId) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    await deleteFriend(name, receiptId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting friend:", error)
    return NextResponse.json({ error: "Failed to delete friend" }, { status: 500 })
  }
}
