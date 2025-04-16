import { connectToDatabase } from './mongodb';
import { IReceipt, ILine, IFriend, IAssignment, Receipt, LineType, IReceiptImage } from './models';
import mongoose from 'mongoose';

// Receipt functions
export async function createReceipt(receipt: Omit<IReceipt, "_id" | "createdAt">) {
  await connectToDatabase();
  
  const newReceipt = new Receipt({
    name: receipt.name,
    subtotal: receipt.subtotal,
    total: receipt.total,
    images: receipt.images || [],
    lines: receipt.lines || [],
    friends: receipt.friends || [],
    assignments: receipt.assignments || []
  });
  
  await newReceipt.save();
  
  // Convert to the expected format
  return {
    _id: newReceipt._id.toString(),
    name: newReceipt.name,
    subtotal: newReceipt.subtotal,
    total: newReceipt.total,
    images: newReceipt.images,
    lines: newReceipt.lines,
    friends: newReceipt.friends,
    assignments: newReceipt.assignments,
    createdAt: newReceipt.createdAt
  } as IReceipt;
}

export async function getReceipt(id: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(id);
  if (!receipt) return null;
  
  // Convert to the expected format
  return {
    _id: receipt._id.toString(),
    name: receipt.name,
    subtotal: receipt.subtotal,
    total: receipt.total,
    images: receipt.images,
    lines: receipt.lines,
    friends: receipt.friends,
    assignments: receipt.assignments,
    createdAt: receipt.createdAt
  } as IReceipt;
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
    _id: newImage._id.toString(),
    imageUrl: newImage.imageUrl,
  } as IReceiptImage;
}

export async function getReceiptImages(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return [];
  
  // Convert to the expected format
  return receipt.images.map((image: any) => ({
    _id: image._id.toString(),
    imageUrl: image.imageUrl,
  })) as IReceiptImage[];
}

// Line functions
export async function createLines(lines: Omit<ILine, "_id">[], receiptId: string) {
  await connectToDatabase();
  
  if (lines.length === 0) return [];
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) throw new Error('Receipt not found');
  
  // Add lines to the receipt
  const newLines = lines.map(line => ({
    name: line.name,
    price: line.price,
    lineType: line.lineType || LineType.ITEM
  }));
  
  receipt.lines.push(...newLines);
  await receipt.save();
  
  // Get the newly added lines
  const addedLines = receipt.lines.slice(-lines.length);
  
  // Convert to the expected format
  return addedLines.map((line: any) => ({
    _id: line._id.toString(),
    name: line.name,
    price: line.price,
    lineType: line.lineType
  })) as ILine[];
}

export async function getLinesByReceiptId(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return [];
  
  // Convert to the expected format
  return receipt.lines.map((line: any) => ({
    _id: line._id.toString(),
    name: line.name,
    price: line.price,
    lineType: line.lineType
  })) as ILine[];
}

// Friend functions
export async function createFriend(name: string, receiptId?: string) {
  await connectToDatabase();

  if (!receiptId) {
    // Error
    throw new Error('Receipt ID is required');
  }
  
  // Add friend to a specific receipt
  const receipt: IReceipt | null = await Receipt.findById(receiptId);
  if (!receipt) throw new Error('Receipt not found');

  // Check if friend with this name already exists in this receipt
  const existingFriend = receipt.friends.find((f: any) => f.name === name);
  if (existingFriend) {
      return existingFriend;
  }

  // Add new friend
  receipt.friends.push({ 
    name, 
    _id: new mongoose.Types.ObjectId().toString() 
  });
  await receipt.save();

  return receipt.friends[receipt.friends.length - 1];
}

export async function getFriends() {
  await connectToDatabase();
  
  // Get all receipts
  const receipts = await Receipt.find();
  
  // Extract unique friends from all receipts
  const uniqueFriends = new Map();
  
  receipts.forEach(receipt => {
    receipt.friends.forEach((friend: any) => {
      if (!uniqueFriends.has(friend.name)) {
        uniqueFriends.set(friend.name, {
          _id: friend._id.toString(),
          name: friend.name,
        });
      }
    });
  });
  
  // Convert to array and sort by name
  return Array.from(uniqueFriends.values()).sort((a, b) => a.name.localeCompare(b.name)) as IFriend[];
}

export async function deleteFriend(name: string, receiptId?: string) {
  await connectToDatabase();
  
  if (receiptId) {
    // Delete friend from a specific receipt
    const receipt = await Receipt.findById(receiptId);
    if (!receipt) throw new Error('Receipt not found');
    
    // Remove the friend from the receipt
    receipt.friends = receipt.friends.filter((f: any) => f.name !== name);
    
    // Also remove any assignments for this friend
    receipt.assignments = receipt.assignments.filter((a: any) => a.friendName !== name);
    
    await receipt.save();
  } else {
    // Find all receipts that have this friend
    const receipts = await Receipt.find({
      'friends.name': name
    });
    
    // Remove the friend from each receipt
    for (const receipt of receipts) {
      receipt.friends = receipt.friends.filter((f: any) => f.name !== name);
      await receipt.save();
    }
    
    // Also remove any assignments for this friend
    for (const receipt of receipts) {
      receipt.assignments = receipt.assignments.filter((a: any) => a.friendName !== name);
      await receipt.save();
    }
  }
}

export async function getAssignmentsByReceiptId(receiptId: string) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) return [];
  
  // Convert to the expected format
  return receipt.assignments.map((assignment: any) => ({
    _id: assignment._id.toString(),
    lineId: assignment.lineId.toString(),
    friendName: assignment.friendName,
  })) as IAssignment[];
}

export async function updateAssignmentsForReceipt(receiptId: string, assignments: Omit<IAssignment, "_id">[]) {
  await connectToDatabase();
  
  const receipt = await Receipt.findById(receiptId);
  if (!receipt) throw new Error('Receipt not found');
  
  // Replace all assignments with the new ones
  receipt.assignments = assignments.map(assignment => ({
    lineId: assignment.lineId,
    friendName: assignment.friendName,
    _id: new mongoose.Types.ObjectId().toString()
  }));
  
  await receipt.save();
  
  // Convert to the expected format
  return receipt.assignments.map((assignment: any) => ({
    _id: assignment._id.toString(),
    lineId: assignment.lineId.toString(),
    friendName: assignment.friendName,
  })) as IAssignment[];
} 