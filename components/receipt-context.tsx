"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import type { IReceipt, ILine, IFriend, IAssignment } from "@/types"

interface ReceiptContextType {
  receipt: IReceipt | null
  setReceipt: (receipt: IReceipt | null) => void
  setLines: (lines: ILine[]) => void
  setFriends: (friends: IFriend[]) => void
  setAssignments: (assignments: IAssignment[]) => void
}

const ReceiptContext = createContext<ReceiptContextType | undefined>(undefined)

export function ReceiptProvider({ children }: { children: ReactNode }) {
  const [receipt, setReceipt] = useState<IReceipt | null>(null)
  const setLines = useCallback((lines: ILine[]) => {
    setReceipt({ ...receipt!, lines })
  }, [receipt])

  const setFriends = useCallback((friends: IFriend[]) => {
    setReceipt({ ...receipt!, friends })
  }, [receipt])

  const setAssignments = useCallback((assignments: IAssignment[]) => {
    setReceipt({ ...receipt!, assignments })
  }, [receipt])

  return (
    <ReceiptContext.Provider
      value={{
        receipt,
        setReceipt,
        setLines,
        setFriends,
        setAssignments,
      }}
    >
      {children}
    </ReceiptContext.Provider>
  )
}

export function useReceipt(): ReceiptContextType {
  const context = useContext(ReceiptContext)
  if (context === undefined) {
    throw new Error("useReceipt must be used within a ReceiptProvider")
  }
  return context
} 
