"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import type { Item, Friend, Assignment } from "@/types"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useDebounce } from "../hooks/use-debounce"

interface ItemAssignmentProps {
  items: Item[]
  friends: Friend[]
  assignments: Assignment[]
  receiptId: string
  onAssignmentsUpdated: (assignments: Assignment[], shouldSwitchTab?: boolean) => void
}

export function ItemAssignment({
  items,
  friends,
  assignments: initialAssignments,
  receiptId,
  onAssignmentsUpdated,
}: ItemAssignmentProps) {
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const isAssigned = (itemId: string, friendId: string) => {
    return assignments.some((a) => a.itemId === itemId && a.friendId === friendId)
  }

  const handleToggleAssignment = (itemId: string, friendId: string) => {
    setIsDirty(true)
    if (isAssigned(itemId, friendId)) {
      setAssignments(assignments.filter((a) => !(a.itemId === itemId && a.friendId === friendId)))
    } else {
      setAssignments([...assignments, { itemId, friendId }])
    }
  }

  const saveAssignments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptId,
          assignments: assignments.map(({ itemId, friendId }) => ({ itemId, friendId })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignments")
      }

      const updatedAssignments = await response.json()
      setAssignments(updatedAssignments)
      setIsDirty(false)
      onAssignmentsUpdated(updatedAssignments)
    } catch (err) {
      console.error("Error saving assignments:", err)
      setError("Failed to save assignments")
    } finally {
      setIsLoading(false)
    }
  }, [assignments, receiptId, onAssignmentsUpdated])

  // Debounce the save operation
  useDebounce(saveAssignments, 5000, [assignments])

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

      <div className="flex justify-end gap-2">
        <Button
          onClick={async () => {
            if (isDirty) {
              await saveAssignments();
            }
            onAssignmentsUpdated(assignments);
          }}
          disabled={isLoading || items.length === 0 || friends.length === 0 || assignments.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : isDirty ? (
            "Save & Continue"
          ) : (
            "Continue to Cost Breakdown"
          )}
        </Button>
      </div>
    </div>
  )
}
