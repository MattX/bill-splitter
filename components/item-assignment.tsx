"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useDebounce } from "../hooks/use-debounce"
import { useReceipt } from "./receipt-context"

interface ItemAssignmentProps {
  onAssignmentsUpdated: (shouldSwitchTab: boolean) => void
}

export function ItemAssignment({ onAssignmentsUpdated }: ItemAssignmentProps) {
  const { items, friends, assignments: globalAssignments, saveAssignments } = useReceipt()
  const [localAssignments, setLocalAssignments] = useState(globalAssignments)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Sync local assignments with global assignments when they change
  useEffect(() => {
    setLocalAssignments(globalAssignments)
  }, [globalAssignments])

  const isAssigned = (itemId: string, friendId: string) => {
    return localAssignments.some((a) => a.itemId === itemId && a.friendId === friendId)
  }

  const handleToggleAssignment = (itemId: string, friendId: string) => {
    setIsDirty(true)
    if (isAssigned(itemId, friendId)) {
      setLocalAssignments(localAssignments.filter((a) => !(a.itemId === itemId && a.friendId === friendId)))
    } else {
      setLocalAssignments([...localAssignments, { itemId, friendId }])
    }
  }

  const saveLocalAssignments = useCallback(async () => {
    if (!isDirty) {
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      await saveAssignments(localAssignments)
      setIsDirty(false)
    } catch (err) {
      console.error("Error saving assignments:", err)
      setError("Failed to save assignments")
    } finally {
      setIsLoading(false)
    }
  }, [localAssignments, saveAssignments, isDirty])

  // Debounce the save operation
  useDebounce(saveLocalAssignments, 5000, [localAssignments])

  // Save on unmount if dirty
  useEffect(() => {
    return () => {
      if (isDirty) {
        saveLocalAssignments()
      }
    }
  }, [isDirty, saveLocalAssignments])

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
              await saveLocalAssignments()
            }
            onAssignmentsUpdated(true)
          }}
          disabled={isLoading || items.length === 0 || friends.length === 0 || localAssignments.length === 0}
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
