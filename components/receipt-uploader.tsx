"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Receipt, Item } from "@/types"
import { Loader2, Upload, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface ReceiptUploaderProps {
  onReceiptProcessed: (receipt: Receipt, items: Item[]) => void
}

export function ReceiptUploader({ onReceiptProcessed }: ReceiptUploaderProps) {
  const [files, setFiles] = useState<File[]>([])
  const [receiptName, setReceiptName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [previews, setPreviews] = useState<string[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || [])
    if (selectedFiles.length > 0) {
      setFiles([...files, ...selectedFiles])
      setError(null)

      // Create previews
      selectedFiles.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })

      // Set a default receipt name based on the first file name if not already set
      if (!receiptName && selectedFiles[0]) {
        const fileName = selectedFiles[0].name.split(".")[0]
        setReceiptName(fileName)
      }
    }
  }

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index))
    setPreviews(previews.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (files.length === 0) {
      setError("Please select at least one receipt image")
      return
    }

    if (!receiptName) {
      setError("Please enter a name for this receipt")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("name", receiptName)

      // Append all files with the same field name
      files.forEach((file) => {
        formData.append("images", file)
      })

      // Simulate progress during upload and processing
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + (100 - prev) * 0.1
          return newProgress > 95 ? 95 : newProgress
        })
      }, 500)

      const response = await fetch("/api/process-receipt", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process receipt")
      }

      const data = await response.json()
      onReceiptProcessed(data.receipt, data.items)
    } catch (err) {
      console.error("Error uploading receipt:", err)
      setError(err instanceof Error ? err.message : "Failed to process receipt")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="receipt-name">Receipt Name</Label>
          <Input
            id="receipt-name"
            value={receiptName}
            onChange={(e) => setReceiptName(e.target.value)}
            placeholder="Dinner at Restaurant"
            disabled={isUploading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="receipt-image">Receipt Images</Label>
          <div className="flex items-center gap-4">
            <Input
              id="receipt-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
              multiple
            />
            <div className="grid w-full gap-2">
              <Label
                htmlFor="receipt-image"
                className="flex cursor-pointer items-center justify-center rounded-md border border-dashed p-8 text-center"
              >
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <div className="text-sm text-muted-foreground">Click to upload receipt images</div>
                  <div className="text-xs text-muted-foreground">
                    You can upload multiple images (e.g., itemized receipt and tip receipt)
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </div>

        {previews.length > 0 && (
          <div className="mt-4">
            <p className="text-sm font-medium mb-2">Previews ({previews.length}):</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {previews.map((preview, index) => (
                <div key={index} className="relative">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-md border">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Receipt preview ${index + 1}`}
                      className="object-contain w-full h-full"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                    onClick={() => removeFile(index)}
                    disabled={isUploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-500 mt-2">{error}</div>}

        {isUploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading and processing...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-2" />
          </div>
        )}

        <Button type="submit" disabled={isUploading || files.length === 0} className="w-full">
          {isUploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Process Receipt"
          )}
        </Button>
      </form>
    </div>
  )
}
