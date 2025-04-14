import { neon } from "@neondatabase/serverless"
import type { Receipt, Item, Friend, Assignment } from "@/types"

const sql = neon(process.env.DATABASE_URL!)

// Receipt functions
export async function createReceipt(receipt: Omit<Receipt, "id" | "createdAt">) {
  const result = await sql`
    INSERT INTO receipts (name, subtotal, tax, tip, total)
    VALUES (${receipt.name}, ${receipt.subtotal}, ${receipt.tax}, ${receipt.tip}, ${receipt.total})
    RETURNING id, name, subtotal, tax, tip, total, created_at as "createdAt"
  `
  return result[0] as Receipt
}

export async function getReceipt(id: number) {
  const result = await sql`
    SELECT id, name, subtotal, tax, tip, total, created_at as "createdAt"
    FROM receipts
    WHERE id = ${id}
  `
  return result[0] as Receipt
}

// Add these new functions after the existing receipt functions

export async function addReceiptImage(receiptId: number, imageUrl: string) {
  const result = await sql`
    INSERT INTO receipt_images (receipt_id, image_url)
    VALUES (${receiptId}, ${imageUrl})
    RETURNING id, receipt_id as "receiptId", image_url as "imageUrl", created_at as "createdAt"
  `
  return result[0]
}

export async function getReceiptImages(receiptId: number) {
  const result = await sql`
    SELECT id, receipt_id as "receiptId", image_url as "imageUrl", created_at as "createdAt"
    FROM receipt_images
    WHERE receipt_id = ${receiptId}
    ORDER BY created_at ASC
  `
  return result
}

// Item functions
export async function createItems(items: Omit<Item, "id" | "createdAt">[]) {
  if (items.length === 0) return []

  // Create a parameterized query with placeholders
  const placeholders = items.map((_, index) => 
    `($${index * 3 + 1}, $${index * 3 + 2}, $${index * 3 + 3})`
  ).join(", ")
  
  // Flatten the values into a single array
  const values = items.flatMap(item => [item.receiptId, item.name, item.price])
  
  const query = `
    INSERT INTO items (receipt_id, name, price)
    VALUES ${placeholders}
    RETURNING id, receipt_id as "receiptId", name, price, created_at as "createdAt"
  `

  const result = await sql.query(query, values)
  return result as Item[]
}

export async function getItemsByReceiptId(receiptId: number) {
  const result = await sql`
    SELECT id, receipt_id as "receiptId", name, price, created_at as "createdAt"
    FROM items
    WHERE receipt_id = ${receiptId}
  `
  return result as Item[]
}

// Friend functions
export async function createFriend(name: string) {
  const result = await sql`
    INSERT INTO friends (name)
    VALUES (${name})
    RETURNING id, name, created_at as "createdAt"
  `
  return result[0] as Friend
}

export async function getFriends() {
  const result = await sql`
    SELECT id, name, created_at as "createdAt"
    FROM friends
  `
  return result as Friend[]
}

// Assignment functions
export async function createAssignment(assignment: Omit<Assignment, "id" | "createdAt">) {
  const result = await sql`
    INSERT INTO assignments (item_id, friend_id)
    VALUES (${assignment.itemId}, ${assignment.friendId})
    ON CONFLICT (item_id, friend_id) DO NOTHING
    RETURNING id, item_id as "itemId", friend_id as "friendId", created_at as "createdAt"
  `
  return result[0] as Assignment
}

export async function deleteAssignment(itemId: number, friendId: number) {
  await sql`
    DELETE FROM assignments
    WHERE item_id = ${itemId} AND friend_id = ${friendId}
  `
}

export async function getAssignmentsByReceiptId(receiptId: number) {
  const result = await sql`
    SELECT a.id, a.item_id as "itemId", a.friend_id as "friendId", a.created_at as "createdAt"
    FROM assignments a
    JOIN items i ON a.item_id = i.id
    WHERE i.receipt_id = ${receiptId}
  `
  return result as Assignment[]
}
