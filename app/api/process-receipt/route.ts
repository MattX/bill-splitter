import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createReceipt, createItems, addReceiptImage } from "@/lib/db"
import type { ProcessedReceipt } from "@/types"
import { put } from "@vercel/blob"

// Initialize the Google Generative AI with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "")

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const receiptName = formData.get("name") as string
    const imageFiles = formData.getAll("images") as File[]

    if (!imageFiles || imageFiles.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 })
    }

    // Convert all images to base64 for Gemini API
    const imageContents = await Promise.all(
      imageFiles.map(async (file) => {
        const imageBytes = await file.arrayBuffer()
        return {
          mimeType: file.type,
          data: Buffer.from(imageBytes).toString("base64"),
        }
      }),
    )

    // Create a model instance
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

    // Prepare the prompt with instructions for multiple receipts
    const prompt = `
      Analyze these receipt images and extract the following information in JSON format:
      1. A list of items with their names and prices
      2. The subtotal
      3. The tax amount
      4. The tip amount (if present, otherwise 0)
      5. The total amount
      
      If there are multiple receipts, combine the information. For example, if one receipt shows
      the itemized bill and another shows the tip amount, use the tip from the second receipt.
      
      Return ONLY a valid JSON object with this structure:
      {
        "items": [
          { "name": "Item Name", "price": 10.99 },
          ...
        ],
        "subtotal": 45.97,
        "tax": 3.68,
        "tip": 9.19,
        "total": 58.84
      }
    `

    // Generate content with all images
    const result = await model.generateContent([
      prompt,
      ...imageContents.map((img) => ({
        inlineData: img,
      })),
    ])

    const response = await result.response
    const text = response.text()

    // Extract the JSON from the response
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/)
    let jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text

    // Clean up the JSON string if needed
    jsonString = jsonString.replace(/^```json\s*|\s*```$/g, "")

    // Parse the JSON
    const processedReceipt: ProcessedReceipt = JSON.parse(jsonString)

    // Save receipt to database
    const receipt = await createReceipt({
      name: receiptName || "Unnamed Receipt",
      subtotal: processedReceipt.subtotal,
      tax: processedReceipt.tax,
      tip: processedReceipt.tip,
      total: processedReceipt.total,
    })

    // Save items to database
    const itemsToCreate = processedReceipt.items.map((item) => ({
      receiptId: receipt.id,
      name: item.name,
      price: item.price,
    }))

    const items = await createItems(itemsToCreate)

    // Upload images to Vercel Blob and store URLs in database
    const uploadPromises = imageFiles.map(async (file, index) => {
      // Generate a unique filename
      const timestamp = Date.now()
      const filename = `receipt-${receipt.id}-${index + 1}-${timestamp}.${file.name.split(".").pop()}`

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      })

      // Store the URL in the database
      await addReceiptImage(receipt.id, blob.url)

      return blob.url
    })

    await Promise.all(uploadPromises)

    return NextResponse.json({ receipt, items })
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 })
  }
}
