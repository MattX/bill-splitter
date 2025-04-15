import mongoose from 'mongoose';

// Check if the connection is already established
const isConnected = mongoose.connection.readyState === 1;

// Connect to MongoDB
export async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
} 