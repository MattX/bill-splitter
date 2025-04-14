"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import type { Friend } from "@/types"
import { Loader2, Plus } from "lucide-react"

interface FriendManagerProps {
  friends: Friend[]
  onFriendsUpdated: (friends: Friend[]) => void
  receiptId: number | undefined
}

export function FriendManager({ friends, onFriendsUpdated, receiptId }: FriendManagerProps) {
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
        onFriendsUpdated(data)
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
        body: JSON.stringify({ name: newFriendName.trim() }),
      })

      if (!response.ok) {
        throw new Error("Failed to add friend")
      }

      const newFriend = await response.json()
      onFriendsUpdated([...friends, newFriend])
      setNewFriendName("")
    } catch (err) {
      console.error("Error adding friend:", err)
      setError("Failed to add friend")
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
              <li key={friend.id} className="flex items-center justify-between rounded-md border p-3">
                <span>{friend.name}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => onFriendsUpdated(friends)} disabled={friends.length === 0}>
          Continue to Item Assignment
        </Button>
      </div>
    </div>
  )
}
