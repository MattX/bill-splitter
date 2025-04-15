import { NextResponse } from "next/server"
import { getReceipt, getItemsByReceiptId, getAssignmentsByReceiptId } from "@/lib/mongodb-db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    const receipt = await getReceipt(id)
    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 })
    }

    const items = await getItemsByReceiptId(id)
    const assignments = await getAssignmentsByReceiptId(id)

    return NextResponse.json({ receipt, items, assignments })
  } catch (error) {
    console.error("Error fetching receipt:", error)
    return NextResponse.json({ error: "Failed to fetch receipt" }, { status: 500 })
  }
} 