"use client"

import { useMemo, useState, useEffect } from "react"
import type { Receipt, Item, Friend, Assignment, ReceiptImage } from "@/types"
import { formatCurrency, calculateFriendCosts } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"

interface CostBreakdownProps {
  receipt: Receipt | null
  items: Item[]
  friends: Friend[]
  assignments: Assignment[]
}

export function CostBreakdown({ receipt, items, friends, assignments }: CostBreakdownProps) {
  const [receiptImages, setReceiptImages] = useState<ReceiptImage[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const friendCosts = useMemo(() => {
    return calculateFriendCosts(receipt, items, friends, assignments)
  }, [receipt, items, friends, assignments])

  useEffect(() => {
    if (receipt) {
      const fetchReceiptImages = async () => {
        try {
          setIsLoading(true)
          const response = await fetch(`/api/receipt-images?receiptId=${receipt.id}`)
          if (response.ok) {
            const data = await response.json()
            setReceiptImages(data)
          }
        } catch (error) {
          console.error("Error fetching receipt images:", error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchReceiptImages()
    }
  }, [receipt])

  if (!receipt) {
    return <div>No receipt data available</div>
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="images">Receipt Images</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Receipt Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <dt>Subtotal:</dt>
                    <dd className="font-medium">{formatCurrency(receipt.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt>Tax:</dt>
                    <dd className="font-medium">{formatCurrency(receipt.tax)}</dd>
                  </div>
                  <div className="flex justify-between text-sm">
                    <dt>Tip:</dt>
                    <dd className="font-medium">{formatCurrency(receipt.tip)}</dd>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-medium">
                    <dt>Total:</dt>
                    <dd>{formatCurrency(receipt.total)}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Split Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-2">
                  {friendCosts.map((cost) => (
                    <div key={cost.friend.id} className="flex justify-between text-sm">
                      <dt>{cost.friend.name}:</dt>
                      <dd className="font-medium">{formatCurrency(cost.total)}</dd>
                    </div>
                  ))}
                </dl>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            {friendCosts.map((cost) => (
              <Card key={cost.friend.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{cost.friend.name}'s Share</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Items</h4>
                      {cost.items.length > 0 ? (
                        <ul className="space-y-1">
                          {cost.items.map((item, index) => (
                            <li key={index} className="flex justify-between text-sm">
                              <span>{item.name}</span>
                              <span className="font-medium">{formatCurrency(item.price)}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground">No items assigned</p>
                      )}
                    </div>

                    <dl className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <dt>Items Subtotal:</dt>
                        <dd className="font-medium">{formatCurrency(cost.itemsSubtotal)}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt>Tax (prorated):</dt>
                        <dd className="font-medium">{formatCurrency(cost.tax)}</dd>
                      </div>
                      <div className="flex justify-between text-sm">
                        <dt>Tip (prorated):</dt>
                        <dd className="font-medium">{formatCurrency(cost.tip)}</dd>
                      </div>
                      <div className="flex justify-between border-t pt-2 font-medium">
                        <dt>Total:</dt>
                        <dd>{formatCurrency(cost.total)}</dd>
                      </div>
                    </dl>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="images">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Receipt Images</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : receiptImages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {receiptImages.map((image, index) => (
                    <div key={image.id} className="border rounded-md overflow-hidden">
                      <div className="aspect-[3/4] relative">
                        <img
                          src={image.imageUrl || "/placeholder.svg"}
                          alt={`Receipt ${index + 1}`}
                          className="object-contain w-full h-full"
                        />
                      </div>
                      <div className="p-2 text-center text-sm text-muted-foreground">Image {index + 1}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">No receipt images available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
