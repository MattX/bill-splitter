"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { formatCurrency } from "@/lib/utils"
import { Loader2 } from "lucide-react"
import { useDebounce } from "../hooks/use-debounce"
import { useReceipt } from "./receipt-context"
import type { IAssignment } from "@/types"
import { LineType } from "@/types/line-type"

interface ItemAssignmentProps {
  onAssignmentsUpdated: (assignments: IAssignment[]) => Promise<void>
  goToNextTab: () => void
}

export function ItemAssignment({ onAssignmentsUpdated, goToNextTab }: ItemAssignmentProps) {
  const { receipt } = useReceipt()
  const [localAssignments, setLocalAssignments] = useState(receipt?.assignments || [])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Sync local assignments with global assignments when they change
  useEffect(() => {
    setLocalAssignments(receipt?.assignments || [])
  }, [receipt])

  const isAssigned = (lineId: string, friendName: string) => {
    return localAssignments.some((a) => a.lineId === lineId && a.friendName === friendName)
  }

  const saveLocalAssignments = useCallback(async () => {
    if (!isDirty) {
      return
    }
    try {
      setIsLoading(true)
      setError(null)
      await onAssignmentsUpdated(localAssignments)
      setIsDirty(false)
    } catch (err) {
      console.error("Error saving assignments:", err)
      setError("Failed to save assignments")
    } finally {
      setIsLoading(false)
    }
  }, [localAssignments, onAssignmentsUpdated, isDirty, setIsDirty, setError, setIsLoading])

  // Debounce the save operation
  const { reset: resetDebounce } = useDebounce(saveLocalAssignments, 5000, [localAssignments])

  const handleToggleAssignment = (lineId: string, friendName: string) => {
    setIsDirty(true)
    resetDebounce()
    if (isAssigned(lineId, friendName)) {
      setLocalAssignments(localAssignments.filter((a) => !(a.lineId === lineId && a.friendName === friendName)))
    } else {
      setLocalAssignments([...localAssignments, { lineId, friendName }])
    }
  }

  // Save on unmount if dirty. Slightly gross trick here
  const isDirtyRef = useRef(isDirty)
  const saveLocalAssignmentsRef = useRef(saveLocalAssignments)
  useEffect(() => {
    isDirtyRef.current = isDirty
    saveLocalAssignmentsRef.current = saveLocalAssignments
  }, [isDirty, saveLocalAssignments])
  useEffect(() => {
    return () => {
      if (isDirtyRef.current) {
        saveLocalAssignmentsRef.current()
      }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-medium">Assign Items to Friends</h3>

        {receipt?.lines.length === 0 ? (
          <p className="text-sm text-muted-foreground">No items found. Please upload a receipt first.</p>
        ) : (
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2 text-left font-medium">Item</th>
                  <th className="px-4 py-2 text-right font-medium">Price</th>
                  {receipt?.friends.map((friend) => (
                    <th key={friend._id} className="px-4 py-2 text-center font-medium">
                      {friend.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {receipt?.lines.filter(l => l.lineType === LineType.ITEM).map((item) => (
                  <tr key={item._id} className="border-b last:border-0">
                    <td className="px-4 py-3">{item.name}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.price)}</td>
                    {receipt?.friends.map((friend) => (
                      <td key={friend._id} className="px-4 py-3 text-center">
                        <Checkbox
                          checked={isAssigned(item._id, friend.name)}
                          onCheckedChange={() => handleToggleAssignment(item._id, friend.name)}
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
            goToNextTab()
          }}
          disabled={isLoading || receipt?.lines.length === 0 || receipt?.friends.length === 0 || localAssignments.length === 0}
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
