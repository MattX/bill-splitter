import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { FriendCost } from "@/types"
import { IReceipt, ILine, IFriend, IAssignment, LineType } from "@/lib/models"

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
  receipt: IReceipt | null,
  items: ILine[],
  friends: IFriend[],
  assignments: IAssignment[],
): FriendCost[] {
  if (!receipt) return []

  const friendCosts: FriendCost[] = []

  // Create a map of line assignments
  const lineAssignments = new Map<string, string[]>()
  items.forEach((item) => {
    lineAssignments.set(item._id, [])
  })

  assignments.forEach((assignment) => {
    const friendNames = lineAssignments.get(assignment.lineId) || []
    friendNames.push(assignment.friendName)
    lineAssignments.set(assignment.lineId, friendNames)
  })

  // Calculate costs for each friend
  friends.forEach((friend) => {
    const friendItems: ILine[] = []
    let itemsSubtotal = 0

    // Find all items assigned to this friend
    items.forEach((item) => {
      const friendNames = lineAssignments.get(item._id) || []
      if (friendNames.includes(friend.name)) {
        // Calculate the split price for this item
        const splitPrice = item.price / friendNames.length
        const splitItem = { ...item, price: splitPrice }
        friendItems.push(splitItem)
        itemsSubtotal += splitPrice
      }
    })

    // Calculate tax and tip proportionally from fee lines
    const feeLines = receipt.lines.filter(line => line.lineType === LineType.FEE)
    const totalFees = feeLines.reduce((sum, line) => sum + line.price, 0)
    
    // Calculate the proportion of items this friend is responsible for
    const proportion = itemsSubtotal / receipt.subtotal
    const friendFees = totalFees * proportion
    
    const total = itemsSubtotal + friendFees

    friendCosts.push({
      friend,
      items: friendItems,
      itemsSubtotal,
      fees: friendFees,
      total,
    })
  })

  return friendCosts
}

export function receiptFees(receipt: IReceipt): number {
  const feeLines = receipt.lines.filter(line => line.lineType === LineType.FEE)
  const totalFees = feeLines.reduce((sum, line) => sum + line.price, 0)
  return totalFees
}

