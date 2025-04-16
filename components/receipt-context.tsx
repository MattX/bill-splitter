"use client"

import { createContext, useContext, useState, useCallback, ReactNode } from "react"
import type { Receipt, Item, Friend, Assignment } from "@/types"

interface ReceiptContextType {
  receipt: Receipt | null
  items: Item[]
  friends: Friend[]
  assignments: Assignment[]
  setReceipt: (receipt: Receipt | null) => void
  setItems: (items: Item[]) => void
  setFriends: (friends: Friend[]) => void
  setAssignments: (assignments: Assignment[]) => void
  saveAssignments: (assignments: Assignment[]) => Promise<void>
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined)

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipt, setReceipt] = useState<Receipt | null>(null)
  const [items, setItems] = useState<Item[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])

  const saveAssignments = useCallback(async (newAssignments: Assignment[]) => {
    if (!receipt) return

    try {
      const response = await fetch("/api/assignments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          receiptId: receipt.id,
          assignments: newAssignments.map(({ itemId, friendName }) => ({ itemId, friendName })),
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