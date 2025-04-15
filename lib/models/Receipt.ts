import mongoose, { Schema, Document } from 'mongoose';

// Define the Item schema as a subdocument
const ItemSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define the ReceiptImage schema as a subdocument
const ReceiptImageSchema = new Schema({
  imageUrl: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define the Assignment schema as a subdocument
const AssignmentSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, required: true },
  friendId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Define the Receipt schema
const ReceiptSchema = new Schema({
  name: { type: String, required: true },
  subtotal: { type: Number, required: true },
  tax: { type: Number, required: true },
  tip: { type: Number, required: true },
  total: { type: Number, required: true },
  images: [ReceiptImageSchema],
  items: [ItemSchema],
  friends: [{ type: Schema.Types.ObjectId, ref: 'Friend' }],
  assignments: [AssignmentSchema],
  createdAt: { type: Date, default: Date.now }
});

// Create and export the model
export const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);

// Define the TypeScript interface
export interface IReceipt extends Document {
  _id: string;
  name: string;
  subtotal: number;
  tax: number;
  tip: number;
  total: number;
  images: {
    _id: string;
    imageUrl: string;
    createdAt: Date;
  }[];
  items: {
    _id: string;
    name: string;
    price: number;
    createdAt: Date;
  }[];
  friends: string[];
  assignments: {
    _id: string;
    itemId: string;
    friendId: string;
    createdAt: Date;
  }[];
  createdAt: Date;
} 