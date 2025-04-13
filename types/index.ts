export interface Receipt {
  id: number
  name: string
  imageUrl?: string
  subtotal: number
  tax: number
  tip: number
  total: number
  createdAt: string
}

export interface Item {
  id: number
  receiptId: number
  name: string
  price: number
  createdAt?: string
}

export interface Friend {
  id: number
  name: string
  createdAt?: string
}

export interface Assignment {
  id?: number
  itemId: number
  friendId: number
  createdAt?: string
}

export interface ProcessedReceipt {
  items: {
    name: string
    price: number
  }[]
  subtotal: number
  tax: number
  tip: number
  total: number
}

export interface FriendCost {
  friend: Friend
  items: Item[]
  itemsSubtotal: number
  tax: number
  tip: number
  total: number
}

export interface ReceiptImage {
  id: number
  receiptId: number
  imageUrl: string
  createdAt?: string
}
