"use client"

import { useState } from "react"
import { ReceiptUploader } from "@/components/receipt-uploader"
import { FriendManager } from "@/components/friend-manager"
import { ItemAssignment } from "@/components/item-assignment"
import { CostBreakdown } from "@/components/cost-breakdown"
import type { Receipt, Friend, Item, Assignment } from "@/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [activeReceipt, setActiveReceipt] = useState<Receipt | null>(null)
  const [friends, setFriends] = useState<Friend[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [activeTab, setActiveTab] = useState("upload")

  const handleReceiptProcessed = async (receipt: Receipt, receiptItems: Item[]) => {
    setActiveReceipt(receipt)
    setItems(receiptItems)
    setActiveTab("friends")
  }

  const handleFriendsUpdated = (updatedFriends: Friend[]) => {
    setFriends(updatedFriends)
    if (updatedFriends.length > 0 && items.length > 0) {
      setActiveTab("assign")
    }
  }

  const handleAssignmentsUpdated = (updatedAssignments: Assignment[]) => {
    setAssignments(updatedAssignments)
    setActiveTab("breakdown")
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
              <ReceiptUploader onReceiptProcessed={handleReceiptProcessed} />
            </TabsContent>

            <TabsContent value="friends" className="mt-0">
              <FriendManager friends={friends} onFriendsUpdated={handleFriendsUpdated} receiptId={activeReceipt?.id} />
            </TabsContent>

            <TabsContent value="assign" className="mt-0">
              <ItemAssignment
                items={items}
                friends={friends}
                assignments={assignments}
                onAssignmentsUpdated={handleAssignmentsUpdated}
              />
            </TabsContent>

            <TabsContent value="breakdown" className="mt-0">
              <CostBreakdown receipt={activeReceipt} items={items} friends={friends} assignments={assignments} />
            </TabsContent>
          </CardContent>
        </Card>
      </Tabs>
    </main>
  )
}
