import mongoose, { Schema, Document } from 'mongoose';

// Define the LineType enum
export enum LineType {
  ITEM = 'ITEM',
  FEE = 'FEE'
}

// Define the Line schema as a subdocument
const LineSchema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  lineType: { type: String, enum: Object.values(LineType), required: true }
});

// Define the ReceiptImage schema as a subdocument
const ReceiptImageSchema = new Schema({
  imageUrl: { type: String, required: true }
});

// Define the Friend schema as a subdocument
const FriendSchema = new Schema({
  name: { type: String, required: true }
});

// Define the Assignment schema as a subdocument
const AssignmentSchema = new Schema({
  lineId: { type: Schema.Types.ObjectId, required: true },
  friendName: { type: String, required: true }
});

// Define the Receipt schema
const ReceiptSchema = new Schema({
  name: { type: String, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
  images: [ReceiptImageSchema],
  lines: [LineSchema],
  friends: [FriendSchema],
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
  total: number;
  images: IReceiptImage[];
  lines: ILine[];
  friends: IFriend[];
  assignments: IAssignment[];
  createdAt: Date;
} 

export interface ILine {
  _id: string;
  name: string;
  price: number;
  lineType: LineType;
}

export interface IReceiptImage {
  _id: string;
  imageUrl: string;
}

export interface IFriend {
  _id: string;
  name: string;
}

export interface IAssignment {
  _id: string;
  lineId: string;
  friendName: string;
}
