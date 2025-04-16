import { Document } from "mongoose"
import { LineType } from "@/types/line-type"

// Define the TypeScript interface
export interface IReceipt {
  _id?: string;
  name: string;
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
  _id?: string;
  imageUrl: string;
}

export interface IFriend {
  _id: string;
  name: string;
}

export interface IAssignment {
  _id?: string;
  lineId: string;
  friendName: string;
}

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
