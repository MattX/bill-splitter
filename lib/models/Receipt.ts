import mongoose, { Schema } from 'mongoose';
import { LineType } from "@/types/line-type"

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
  total: { type: Number, required: true },
  images: [ReceiptImageSchema],
  lines: [LineSchema],
  friends: [FriendSchema],
  assignments: [AssignmentSchema],
  createdAt: { type: Date, default: Date.now }
});

// Create and export the model
export const Receipt = mongoose.models.Receipt || mongoose.model('Receipt', ReceiptSchema);
