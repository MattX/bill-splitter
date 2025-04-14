import { NextResponse } from "next/server"
import { createAssignment, getAssignmentsByReceiptId, deleteAllAssignmentsForReceipt } from "@/lib/db"

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
    const { receiptId, assignments } = await request.json()

    if (!receiptId || !Array.isArray(assignments)) {
      return NextResponse.json({ error: "Receipt ID and assignments array are required" }, { status: 400 })
    }

    // First, delete all existing assignments for this receipt
    await deleteAllAssignmentsForReceipt(Number.parseInt(receiptId))

    // Then create all new assignments
    const createdAssignments = await Promise.all(
      assignments.map(({ itemId, friendId }) => createAssignment({ itemId, friendId }))
    )

    return NextResponse.json(createdAssignments)
  } catch (error) {
    console.error("Error updating assignments:", error)
    return NextResponse.json({ error: "Failed to update assignments" }, { status: 500 })
  }
}
