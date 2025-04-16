"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ReceiptUploader } from "@/components/receipt-uploader"
import { FriendManager } from "@/components/friend-manager"
import { ItemAssignment } from "@/components/item-assignment"
import { CostBreakdown } from "@/components/cost-breakdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useReceipt } from "@/components/receipt-context"
import { useToast } from "@/hooks/use-toast"
import type { ILine, IReceipt, IFriend, IReceiptImage, IAssignment } from "@/types"

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { 
    receipt: activeReceipt, 
    setReceipt: setActiveReceipt, 
    setFriends,
    setAssignments 
  } = useReceipt()
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingImages, setIsLoadingImages] = useState(false)
  const [receiptImages, setReceiptImages] = useState<IReceiptImage[]>([])

  // Load receipt from URL parameter on initial load
  useEffect(() => {
    const receiptId = searchParams.get("id")
    if (receiptId) {
      setIsLoading(true)
      fetch(`/api/receipts?id=${receiptId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.receipt) {
            setActiveReceipt(data.receipt)
            fetchReceiptImages(receiptId)
          } else {
            // Show toast when receipt is not found
            toast({
              title: "Receipt not found",
              description: "The requested receipt could not be found.",
              variant: "destructive",
            })
            // Remove the URL parameter
            router.replace("/")
          }
        })
        .catch((error) => {
          console.error("Error loading receipt:", error)
          // Show toast for error
          toast({
            title: "Error loading receipt",
            description: "There was a problem loading the receipt. Please try again.",
            variant: "destructive",
          })
          // Remove the URL parameter
          router.replace("/")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [searchParams, toast, router])

  const fetchReceiptImages = async (receiptId: string) => {
    try {
      setIsLoadingImages(true)
      const response = await fetch(`/api/receipt-images?receiptId=${receiptId}`)
      if (response.ok) {
        const data = await response.json()
        setReceiptImages(data)
      }
    } catch (error) {
      console.error("Error fetching receipt images:", error)
    } finally {
      setIsLoadingImages(false)
    }
  }

  const handleReceiptProcessed = async (receipt: IReceipt) => {
    setActiveReceipt(receipt)
    setActiveTab("friends")
    // Update URL with receipt ID
    router.push(`?id=${receipt._id!}`)
  }

  const handleUploadImages = async (files: File[], name: string) => {
    const formData = new FormData()
    formData.append("name", name)

    // Append all files with the same field name
    files.forEach((file) => {
      formData.append("images", file)
    })

    const response = await fetch("/api/process-receipt", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to process receipt")
    }

    const data = await response.json()
    handleReceiptProcessed(data.receipt)
  }

  const handleAddFriend = async (name: string) => {
    if (!activeReceipt) return

    const response = await fetch("/api/friends", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ 
        name: name,
        receiptId: activeReceipt._id 
      }),
    })

    if (!response.ok) {
      throw new Error("Failed to add friend")
    }

    const newFriend = await response.json()
    setFriends([...activeReceipt.friends, newFriend])
  }

  const handleDeleteFriend = async (friend: IFriend) => {
    if (!activeReceipt) return

    const response = await fetch(`/api/friends?name=${encodeURIComponent(friend.name)}&receiptId=${activeReceipt._id}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      throw new Error("Failed to delete friend")
    }

    setFriends(activeReceipt.friends.filter((f) => f._id !== friend._id))
  }

  const handleSaveAssignments = async (newAssignments: IAssignment[]) => {
    if (!activeReceipt) return

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptId: activeReceipt._id,
          assignments: newAssignments.map(({ lineId, friendName }) => ({ lineId, friendName })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignments")
      }

      const updatedAssignments = await response.json()
      setAssignments(updatedAssignments)
      setActiveTab("breakdown")
    } catch (err) {
      console.error("Error saving assignments:", err)
      throw err
    }
  }

  const handleResetReceipt = () => {
    setActiveReceipt(null)
    setReceiptImages([])
    setActiveTab("upload")
    // Remove the URL parameter
    router.replace("/")
  }

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Bill Splitter</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="upload">Upload Receipt</TabsTrigger>
          <TabsTrigger value="friends" disabled={!activeReceipt}>
            Add Friends
          </TabsTrigger>
          <TabsTrigger value="assign" disabled={!activeReceipt || activeReceipt.friends.length === 0}>
            Assign Items
          </TabsTrigger>
          <TabsTrigger value="breakdown" disabled={!activeReceipt || activeReceipt.friends.length === 0 || activeReceipt.assignments.length === 0}>
            Cost Breakdown
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "upload" && "Upload Receipt"}
              {activeTab === "friends" && "Add Friends"}
              {activeTab === "assign" && "Assign Items to Friends"}
              {activeTab === "breakdown" && "Cost Breakdown"}
            </CardTitle>
            <CardDescription>
              {activeTab === "upload" && "Upload a receipt image to get started"}
              {activeTab === "friends" && "Add the friends who shared this meal"}
              {activeTab === "assign" && "Select who had each item"}
              {activeTab === "breakdown" && "See how much each person owes"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value="upload" className="mt-0">
              <ReceiptUploader 
                onUploadImages={handleUploadImages}
                onResetReceipt={handleResetReceipt}
              />
            </TabsContent>

            <TabsContent value="friends" className="mt-0">
              <FriendManager 
                onAddFriend={handleAddFriend}
                onDeleteFriend={handleDeleteFriend}
                isLoading={isLoading}
              />
              <div className="flex justify-end mt-6">
                <Button onClick={() => setActiveTab("assign")} disabled={activeReceipt?.friends.length === 0}>
                  Continue to Item Assignment
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="assign" className="mt-0">
              {activeReceipt ? (
                <ItemAssignment
                  key={activeReceipt._id} // Force state to clear when receipt ID changes
                  onAssignmentsUpdated={handleSaveAssignments}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="breakdown" className="mt-0">
              {activeReceipt ? (
                <CostBreakdown   />
              ) : null}
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  )
}
