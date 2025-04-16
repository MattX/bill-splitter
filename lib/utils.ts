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
  const itemAssignments = new Map<string, string[]>()
  items.forEach((item) => {
    itemAssignments.set(item.id, [])
  })

  assignments.forEach((assignment) => {
    const friendNames = itemAssignments.get(assignment.itemId) || []
    friendNames.push(assignment.friendName)
    itemAssignments.set(assignment.itemId, friendNames)
  })

  // Calculate costs for each friend
  friends.forEach((friend) => {
    const friendItems: Item[] = []
    let itemsSubtotal = 0

    // Find all items assigned to this friend
    items.forEach((item) => {
      const friendNames = itemAssignments.get(item.id) || []
      if (friendNames.includes(friend.name)) {
        // Calculate the split price for this item
        const splitPrice = item.price / friendNames.length
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
