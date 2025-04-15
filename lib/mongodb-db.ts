import { connectToDatabase } from './mongodb';
import { Receipt, Friend, IReceipt, IFriend } from './models';
import type { Receipt as ReceiptType, Item, Friend as FriendType, Assignment, ReceiptImage } from '@/types';

// Receipt functions
export async function createReceipt(receipt: Omit<ReceiptType, "id" | "createdAt">) {
  await connectToDatabase();
  
  const newReceipt = new Receipt({
    name: receipt.name,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    tip: receipt.tip,
    total: receipt.total,
  });
  
  await newReceipt.save();
  
  // Convert to the expected format
  return {
    id: newReceipt._id.toString(),
    name: newReceipt.name,
    subtotal: newReceipt.subtotal,
    tax: newReceipt.tax,
    tip: newReceipt.tip,
    total: newReceipt.total,
    createdAt: newReceipt.createdAt.toISOString(),
  } as ReceiptType;
}

export async function getReceipt(id: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(id);
  if (!receipt) return null;
  
  // Convert to the expected format
  return {
    id: receipt._id.toString(),
    name: receipt.name,
    subtotal: receipt.subtotal,
    tax: receipt.tax,
    tip: receipt.tip,
    total: receipt.total,
    createdAt: receipt.createdAt.toISOString(),
  } as ReceiptType;
}

export async function addReceiptImage(receiptId: string, imageUrl: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) throw new Error('Receipt not found');
  
  receipt.images.push({ imageUrl });
  await receipt.save();
  
  const newImage = receipt.images[receipt.images.length - 1];
  
  // Convert to the expected format
  return {
    id: newImage._id.toString(),
    receiptId: receipt._id.toString(),
    imageUrl: newImage.imageUrl,
    createdAt: newImage.createdAt.toISOString(),
  } as ReceiptImage;
}

export async function getReceiptImages(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return [];
  
  // Convert to the expected format
  return receipt.images.map((image: any) => ({
    id: image._id.toString(),
    receiptId: receipt._id.toString(),
    imageUrl: image.imageUrl,
    createdAt: image.createdAt.toISOString(),
  })) as ReceiptImage[];
}

// Item functions
export async function createItems(items: Omit<Item, "id" | "createdAt">[]) {
  await connectToDatabase();
  
  if (items.length === 0) return [];
  
  const receipt = await Receipt.findById(items[0].receiptId);
  if (!receipt) throw new Error('Receipt not found');
  
  // Add items to the receipt
  const newItems = items.map(item => ({
    name: item.name,
    price: item.price,
  }));
  
  receipt.items.push(...newItems);
  await receipt.save();
  
  // Get the newly added items
  const addedItems = receipt.items.slice(-items.length);
  
  // Convert to the expected format
  return addedItems.map((item: any) => ({
    id: item._id.toString(),
    receiptId: receipt._id.toString(),
    name: item.name,
    price: item.price,
    createdAt: item.createdAt.toISOString(),
  })) as Item[];
}

export async function getItemsByReceiptId(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return [];
  
  // Convert to the expected format
  return receipt.items.map((item: any) => ({
    id: item._id.toString(),
    receiptId: receipt._id.toString(),
    name: item.name,
    price: item.price,
    createdAt: item.createdAt.toISOString(),
  })) as Item[];
}

// Friend functions
export async function createFriend(name: string) {
  await connectToDatabase();
  
  const newFriend = new Friend({ name });
  await newFriend.save();
  
  // Convert to the expected format
  return {
    id: newFriend._id.toString(),
    name: newFriend.name,
    createdAt: newFriend.createdAt.toISOString(),
  } as FriendType;
}

export async function getFriends() {
  await connectToDatabase();
  
  const friends = await Friend.find().sort({ createdAt: 1 });
  
  // Convert to the expected format
  return friends.map(friend => ({
    id: friend._id.toString(),
    name: friend.name,
    createdAt: friend.createdAt.toISOString(),
  })) as FriendType[];
}

export async function deleteFriend(id: string) {
  await connectToDatabase();
  
  await Friend.findByIdAndDelete(id);
}

// Assignment functions
export async function createAssignment(assignment: Omit<Assignment, "id" | "createdAt"> & { receiptId: string }) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(assignment.receiptId);
  if (!receipt) throw new Error('Receipt not found');
  
  // Check if assignment already exists
  const existingAssignment = receipt.assignments.find(
    (a: any) => a.itemId.toString() === assignment.itemId && a.friendId.toString() === assignment.friendId
  );
  
  if (existingAssignment) {
    // Convert to the expected format
    return {
      id: existingAssignment._id.toString(),
      itemId: existingAssignment.itemId.toString(),
      friendId: existingAssignment.friendId.toString(),
      createdAt: existingAssignment.createdAt.toISOString(),
    } as Assignment;
  }
  
  // Add new assignment
  receipt.assignments.push({
    itemId: assignment.itemId,
    friendId: assignment.friendId,
  });
  
  await receipt.save();
  
  const newAssignment = receipt.assignments[receipt.assignments.length - 1];
  
  // Convert to the expected format
  return {
    id: newAssignment._id.toString(),
    itemId: newAssignment.itemId.toString(),
    friendId: newAssignment.friendId.toString(),
    createdAt: newAssignment.createdAt.toISOString(),
  } as Assignment;
}

export async function deleteAssignment(itemId: string, friendId: string) {
  await connectToDatabase();
  
  // Find all receipts that might have this assignment
  const receipts = await Receipt.find({
    'assignments.itemId': itemId,
    'assignments.friendId': friendId,
  });
  
  // Remove the assignment from each receipt
  for (const receipt of receipts) {
    receipt.assignments = receipt.assignments.filter(
      (a: any) => a.itemId.toString() !== itemId || a.friendId.toString() !== friendId
    );
    await receipt.save();
  }
}

export async function getAssignmentsByReceiptId(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return [];
  
  // Convert to the expected format
  return receipt.assignments.map((assignment: any) => ({
    id: assignment._id.toString(),
    itemId: assignment.itemId.toString(),
    friendId: assignment.friendId.toString(),
    createdAt: assignment.createdAt.toISOString(),
  })) as Assignment[];
}

export async function deleteAllAssignmentsForReceipt(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return;
  
  receipt.assignments = [];
  await receipt.save();
} 