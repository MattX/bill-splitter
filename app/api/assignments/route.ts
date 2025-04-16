import { NextResponse } from "next/server"
import { getAssignmentsByReceiptId, updateAssignmentsForReceipt } from "@/lib/mongodb-db"

export async function POST(request: Request) {
  try {
    const { receiptId, assignments } = await request.json()

    if (!receiptId || !Array.isArray(assignments)) {
      return NextResponse.json({ error: "Receipt ID and assignments array are required" }, { status: 400 })
    }

    const updatedAssignments = await updateAssignmentsForReceipt(receiptId, assignments)
    return NextResponse.json(updatedAssignments)
  } catch (error) {
    console.error("Error updating assignments:", error)
    return NextResponse.json({ error: "Failed to update assignments" }, { status: 500 })
  }
}
