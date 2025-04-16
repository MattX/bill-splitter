import { NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"
import { createReceipt } from "@/lib/mongodb-db"
import { put } from "@vercel/blob"
import { LineType } from "@/types/line-type"
import type { IReceipt } from "@/types"

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
      1. A list of items with their names, prices, and line types (ITEM or FEE)
      2. The total amount
      
      For each line item, determine if it's an ITEM (food, drink, product) or a FEE (tax, tip, service charge, delivery fee, etc.)
      
      If there are multiple receipts, combine the information.
      
      If the image is not a receipt or cannot be processed, return an error object.
      
      Return ONLY a valid JSON object with this structure:
      {
        "lines": [
          { "name": "Item Name", "price": 10.99, "lineType": "ITEM" },
          { "name": "Tax", "price": 3.68, "lineType": "FEE" },
          { "name": "Tip", "price": 9.19, "lineType": "FEE" },
          ...
        ],
        "total": 58.84
      }
      
      OR if the image is not a receipt, or you are unable to parse it:
      {
        "error": "Unable to process image. Please upload a valid receipt."
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
    const parsedResponse = JSON.parse(jsonString)

    // Check if there's an error
    if (parsedResponse.error) {
      return NextResponse.json({ error: parsedResponse.error }, { status: 400 })
    }

    // Calculate subtotal from lines
    const subtotal = parsedResponse.lines.reduce((sum: number, line: any) => {
      return sum + line.price
    }, 0)

    // Upload images to Vercel Blob first
    const uploadPromises = imageFiles.map(async (file, index) => {
      // Generate a unique filename
      const timestamp = Date.now()
      const filename = `receipt-${index + 1}-${timestamp}.${file.name.split(".").pop()}`

      // Upload to Vercel Blob
      const blob = await put(filename, file, {
        access: "public",
      })

      return blob.url
    })

    const imageUrls = await Promise.all(uploadPromises)

    // Create receipt with images and lines
    const receipt = await createReceipt({
      name: receiptName || "Unnamed Receipt",
      subtotal: subtotal,
      total: parsedResponse.total,
      images: imageUrls.map(url => ({ imageUrl: url })),
      lines: parsedResponse.lines.map((line: any) => ({
        name: line.name,
        price: line.price,
        lineType: line.lineType as LineType
      })),
      friends: [],
      assignments: []
    } as unknown as Omit<IReceipt, "_id" | "createdAt">)

    return NextResponse.json({ receipt })
  } catch (error) {
    console.error("Error processing receipt:", error)
    return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 })
  }
}
