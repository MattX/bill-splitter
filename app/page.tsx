"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { ReceiptUploader } from "@/components/receipt-uploader"
import { FriendManager } from "@/components/friend-manager"
import { ItemAssignment } from "@/components/item-assignment"
import { CostBreakdown } from "@/components/cost-breakdown"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useReceipt } from "@/components/receipt-context"
import { useToast } from "@/hooks/use-toast"
import type { ILine, IReceipt, IFriend } from "@/types"

export default function Home() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  const { 
    receipt: activeReceipt, 
    setReceipt: setActiveReceipt, 
    friends, 
    setFriends, 
    items, 
    setItems, 
    assignments, 
    setAssignments 
  } = useReceipt()
  const [activeTab, setActiveTab] = useState("upload")
  const [isLoading, setIsLoading] = useState(false)

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
            setItems(data.items)
            setAssignments(data.assignments)
            setActiveTab("breakdown")
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
  }, [searchParams, setActiveReceipt, setItems, setAssignments, toast, router])

  const handleReceiptProcessed = async (receipt: IReceipt, receiptItems: ILine[]) => {
    setActiveReceipt(receipt)
    setItems(receiptItems)
    setActiveTab("friends")
    // Update URL with receipt ID
    router.push(`?id=${receipt.id}`)
  }

  const handleFriendsUpdated = (updatedFriends: IFriend[], shouldSwitchTab?: boolean) => {
    setFriends(updatedFriends)
    if (shouldSwitchTab && updatedFriends.length > 0 && items.length > 0) {
      setActiveTab("assign")
    }
  }

  const handleAssignmentsUpdated = (shouldSwitchTab: boolean) => {
    if (shouldSwitchTab) {
      setActiveTab("breakdown")
    }
  }

  const handleResetReceipt = () => {
    setActiveReceipt(null)
    setItems([])
    setFriends([])
    setAssignments([])
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
          <TabsTrigger value="assign" disabled={!activeReceipt || friends.length === 0}>
            Assign Items
          </TabsTrigger>
          <TabsTrigger value="breakdown" disabled={!activeReceipt || friends.length === 0 || assignments.length === 0}>
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
                onReceiptProcessed={handleReceiptProcessed} 
                receiptId={activeReceipt?.id} 
                onResetReceipt={handleResetReceipt}
              />
            </TabsContent>

            <TabsContent value="friends" className="mt-0">
              <FriendManager friends={friends} onFriendsUpdated={handleFriendsUpdated} />
            </TabsContent>

            <TabsContent value="assign" className="mt-0">
              {activeReceipt ? (
                <ItemAssignment
                  key={activeReceipt.id} // Force state to clear when receipt ID changes
                  onAssignmentsUpdated={handleAssignmentsUpdated}
                />
              ) : null}
            </TabsContent>

            <TabsContent value="breakdown" className="mt-0">
              <CostBreakdown />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  )
}
