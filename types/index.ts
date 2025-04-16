import { IFriend, ILine, LineType } from "@/lib/models"

export interface ProcessedReceipt {
  lines: {
    name: string
    price: number
    lineType: LineType
  }[]
  subtotal: number
  total: number
}

export interface FriendCost {
  friend: IFriend
  items: ILine[]
  itemsSubtotal: number
  fees: number
  total: number
}
