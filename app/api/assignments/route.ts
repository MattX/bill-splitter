import { NextResponse } from "next/server"
import { createAssignment, deleteAssignment, getAssignmentsByReceiptId } from "@/lib/db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptId = searchParams.get("receiptId")

    if (!receiptId) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    const assignments = await getAssignmentsByReceiptId(Number.parseInt(receiptId))
    return NextResponse.json(assignments)
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { itemId, friendId } = await request.json()

    if (!itemId || !friendId) {
      return NextResponse.json({ error: "Item ID and Friend ID are required" }, { status: 400 })
    }

    const assignment = await createAssignment({ itemId, friendId })
    return NextResponse.json(assignment)
  } catch (error) {
    console.error("Error creating assignment:", error)
    return NextResponse.json({ error: "Failed to create assignment" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get("itemId")
    const friendId = searchParams.get("friendId")

    if (!itemId || !friendId) {
      return NextResponse.json({ error: "Item ID and Friend ID are required" }, { status: 400 })
    }

    await deleteAssignment(Number.parseInt(itemId), Number.parseInt(friendId))
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting assignment:", error)
    return NextResponse.json({ error: "Failed to delete assignment" }, { status: 500 })
  }
}
