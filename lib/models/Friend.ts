import mongoose, { Schema, Document } from 'mongoose';

// Define the Friend schema
const FriendSchema = new Schema({
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Create and export the model
export const Friend = mongoose.models.Friend || mongoose.model('Friend', FriendSchema);

// Define the TypeScript interface
export interface IFriend extends Document {
  _id: string;
  name: string;
  createdAt: Date;
} 