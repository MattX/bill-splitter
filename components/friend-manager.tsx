"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { IFriend } from "@/types"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useReceipt } from "./receipt-context"

interface FriendManagerProps {
  onAddFriend: (name: string) => Promise<void>
  onDeleteFriend: (friend: IFriend) => Promise<void>
  isLoading: boolean
  goToNextTab: () => void
}

export function FriendManager({ onAddFriend, onDeleteFriend, isLoading, goToNextTab }: FriendManagerProps) {
  const { receipt } = useReceipt()
  const [newFriendName, setNewFriendName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newFriendName.trim()) {
      setError("Please enter a friend name")
      return
    }

    try {
      setError(null)
      await onAddFriend(newFriendName.trim())
      setNewFriendName("")
    } catch (err) {
      console.error("Error adding friend:", err)
      setError("Failed to add friend")
    }
  }

  const handleDeleteFriend = async (friend: IFriend) => {
    if (!receipt) {
      setError("No receipt selected")
      return
    }

    try {
      setError(null)
      await onDeleteFriend(friend)
    } catch (err) {
      console.error("Error deleting friend:", err)
      setError("Failed to delete friend")
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleAddFriend} className="flex items-center gap-2">
        <Input
          value={newFriendName}
          onChange={(e) => setNewFriendName(e.target.value)}
          placeholder="Enter friend's name"
          disabled={isLoading}
        />
        <Button type="submit" disabled={isLoading || !newFriendName.trim()}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          <span className="ml-2">Add</span>
        </Button>
      </form>

      {error && <div className="text-sm text-red-500">{error}</div>}

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Friends ({receipt?.friends.length})</h3>

        {receipt?.friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No friends added yet. Add some friends to split the bill with.
          </p>
        ) : (
          <ul className="space-y-2">
            {receipt?.friends.map((friend) => (
              <li key={friend._id} className="flex items-center justify-between rounded-md border p-3">
                <span>{friend.name}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteFriend(friend)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button onClick={goToNextTab} disabled={isLoading || receipt?.friends.length === 0}>
          Continue to Item Assignment
        </Button>
      </div>
    </div>
  )
}
