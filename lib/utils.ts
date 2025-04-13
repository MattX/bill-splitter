import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FriendCost, Receipt, Item, Friend, Assignment } from "@/types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function calculateFriendCosts(
  receipt: Receipt | null,
  items: Item[],
  friends: Friend[],
  assignments: Assignment[],
): FriendCost[] {
  if (!receipt) return []

  const friendCosts: FriendCost[] = []

  // Create a map of item assignments
  const itemAssignments = new Map<number, number[]>()
  items.forEach((item) => {
    itemAssignments.set(item.id, [])
  })

  assignments.forEach((assignment) => {
    const friendIds = itemAssignments.get(assignment.itemId) || []
    friendIds.push(assignment.friendId)
    itemAssignments.set(assignment.itemId, friendIds)
  })

  // Calculate costs for each friend
  friends.forEach((friend) => {
    const friendItems: Item[] = []
    let itemsSubtotal = 0

    // Find all items assigned to this friend
    items.forEach((item) => {
      const friendIds = itemAssignments.get(item.id) || []
      if (friendIds.includes(friend.id)) {
        // Calculate the split price for this item
        const splitPrice = item.price / friendIds.length
        const splitItem = { ...item, price: splitPrice }
        friendItems.push(splitItem)
        itemsSubtotal += splitPrice
      }
    })

    // Calculate tax and tip proportionally
    const proportion = itemsSubtotal / receipt.subtotal
    const tax = receipt.tax * proportion
    const tip = receipt.tip * proportion
    const total = itemsSubtotal + tax + tip

    friendCosts.push({
      friend,
      items: friendItems,
      itemsSubtotal,
      tax,
      tip,
      total,
    })
  })

  return friendCosts
}
