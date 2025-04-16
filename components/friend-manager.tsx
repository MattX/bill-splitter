"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { IFriend } from "@/lib/models"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { useReceipt } from "./receipt-context"

interface FriendManagerProps {
  friends: IFriend[]
  onFriendsUpdated: (friends: IFriend[], shouldSwitchTab?: boolean) => void
}

export function FriendManager({ friends, onFriendsUpdated }: FriendManagerProps) {
  const { receipt } = useReceipt()
  const [newFriendName, setNewFriendName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load existing friends when component mounts
    const loadFriends = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/friends")

        if (!response.ok) {
          throw new Error("Failed to load friends")
        }

        const data = await response.json()
        onFriendsUpdated(data, false)
      } catch (err) {
        console.error("Error loading friends:", err)
        setError("Failed to load friends")
      } finally {
        setIsLoading(false)
      }
    }

    loadFriends()
  }, [])

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newFriendName.trim()) {
      setError("Please enter a friend name")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/friends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          name: newFriendName.trim(),
          receiptId: receipt?._id 
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add friend")
      }

      const newFriend = await response.json()
      onFriendsUpdated([...friends, newFriend], false)
      setNewFriendName("")
    } catch (err) {
      console.error("Error adding friend:", err)
      setError("Failed to add friend")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteFriend = async (friend: IFriend) => {
    if (!receipt) {
      setError("No receipt selected")
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/friends?name=${encodeURIComponent(friend.name)}&receiptId=${receipt._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete friend")
      }

      onFriendsUpdated(friends.filter((f) => f._id !== friend._id), false)
    } catch (err) {
      console.error("Error deleting friend:", err)
      setError("Failed to delete friend")
    } finally {
      setIsLoading(false)
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
        <h3 className="text-sm font-medium">Friends ({friends.length})</h3>

        {friends.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No friends added yet. Add some friends to split the bill with.
          </p>
        ) : (
          <ul className="space-y-2">
            {friends.map((friend) => (
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

      <div className="flex justify-end">
        <Button onClick={() => onFriendsUpdated(friends, true)} disabled={friends.length === 0}>
          Continue to Item Assignment
        </Button>
      </div>
    </div>
  )
}
