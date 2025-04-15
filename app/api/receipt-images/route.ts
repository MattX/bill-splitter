import { NextResponse } from "next/server"
import { getReceiptImages } from "@/lib/mongodb-db"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const receiptId = searchParams.get("receiptId")

    if (!receiptId) {
      return NextResponse.json({ error: "Receipt ID is required" }, { status: 400 })
    }

    const images = await getReceiptImages(receiptId)
    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching receipt images:", error)
    return NextResponse.json({ error: "Failed to fetch receipt images" }, { status: 500 })
  }
}
