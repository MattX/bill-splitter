"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Item, Friend, Assignment } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface ItemAssignmentProps {
  items: Item[]
  friends: Friend[]
  assignments: Assignment[]
  onAssignmentsUpdated: (assignments: Assignment[]) => void
}

export function ItemAssignment({
  items,
  friends,
  assignments: initialAssignments,
  onAssignmentsUpdated,
}: ItemAssignmentProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAssigned = (itemId: number, friendId: number) => {
    return assignments.some((a) => a.itemId === itemId && a.friendId === friendId)
  }

  const handleToggleAssignment = async (itemId: number, friendId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      if (isAssigned(itemId, friendId)) {
        // Remove assignment
        const response = await fetch(`/api/assignments?itemId=${itemId}&friendId=${friendId}`, {
          method: "DELETE",
        })

        if (!response.ok) {
          throw new Error("Failed to remove assignment")
        }

        setAssignments(assignments.filter((a) => !(a.itemId === itemId && a.friendId === friendId)))
      } else {
        // Add assignment
        const response = await fetch("/api/assignments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId, friendId }),
        })

        if (!response.ok) {
          throw new Error("Failed to add assignment")
        }

        const newAssignment = await response.json()
        setAssignments([...assignments, newAssignment])
      }
    } catch (err) {
      console.error("Error toggling assignment:", err)
      setError("Failed to update assignment")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAssignments = () => {
    onAssignmentsUpdated(assignments)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Assign Items to Friends</h3>

        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items found. Please upload a receipt first.</p>
        ) : (
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">Item</th>
                  <th className="px-4 py-2 text-right font-medium">Price</th>
                  {friends.map((friend) => (
                    <th key={friend.id} className="px-4 py-2 text-center font-medium">
                      {friend.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    {friends.map((friend) => (
                      <td key={friend.id} className="px-4 py-3 text-center">
                        <Checkbox
                          checked={isAssigned(item.id, friend.id)}
                          onCheckedChange={() => handleToggleAssignment(item.id, friend.id)}
                          disabled={isLoading}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="flex justify-end">
        <Button
          onClick={handleSaveAssignments}
          disabled={isLoading || items.length === 0 || friends.length === 0 || assignments.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Continue to Cost Breakdown"
          )}
        </Button>
      </div>
    </div>
  )
}
