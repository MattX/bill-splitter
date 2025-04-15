export interface Receipt {
  id: string
  name: string
  imageUrl?: string[]
  subtotal: number
  tax: number
  tip: number
  total: number
  createdAt: string
}

export interface Item {
  id: string
  receiptId: string
  name: string
  price: number
  createdAt?: string
}

export interface Friend {
  id: string
  name: string
  createdAt?: string
}

export interface Assignment {
  id?: string
  itemId: string
  friendId: string
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
  id: string
  receiptId: string
  imageUrl: string
  createdAt?: string
}
