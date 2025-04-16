"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { IReceipt, ILine, IFriend, IAssignment } from "@/types"

interface ReceiptContextType {
  receipt: IReceipt | null
  items: ILine[]
  friends: IFriend[]
  assignments: IAssignment[]
  setReceipt: (receipt: IReceipt | null) => void
  setItems: (items: ILine[]) => void
  setFriends: (friends: IFriend[]) => void
  setAssignments: (assignments: IAssignment[]) => void
  saveAssignments: (assignments: IAssignment[]) => Promise<void>
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined)

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipt, setReceipt] = useState<IReceipt | null>(null)
  const [items, setItems] = useState<ILine[]>([])
  const [friends, setFriends] = useState<IFriend[]>([])
  const [assignments, setAssignments] = useState<IAssignment[]>([])

  const saveAssignments = useCallback(async (newAssignments: IAssignment[]) => {
    if (!receipt) return

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptId: receipt._id,
          assignments: newAssignments.map(({ lineId, friendName }) => ({ lineId, friendName })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update assignments")
      }

      const updatedAssignments = await response.json()
      setAssignments(updatedAssignments)
    } catch (err) {
      console.error("Error saving assignments:", err)
      throw err
    }
  }, [receipt])

  return (
    <ReceiptContext.Provider
      value={{
        receipt,
        items,
        friends,
        assignments,
        setReceipt,
        setItems,
        setFriends,
        setAssignments,
        saveAssignments,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  )
}

export function useReceipt() {
  const context = useContext(ReceiptContext)
  if (context === undefined) {
    throw new Error("useReceipt must be used within a ReceiptProvider")
  }
  return context
} 