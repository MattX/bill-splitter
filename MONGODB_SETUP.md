# MongoDB Atlas Setup for Bill Splitter

This document provides instructions on how to set up and use MongoDB Atlas for the Bill Splitter application.

## Setting Up MongoDB Atlas

1. **Create a MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and sign up for a free account.

2. **Create a New Cluster**
   - Click "Build a Database"
   - Choose the "FREE" tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set Up Database Access**
   - In the left sidebar, click "Database Access"
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and password (make sure to remember these)
   - Set privileges to "Read and write to any database"
   - Click "Add User"

4. **Set Up Network Access**
   - In the left sidebar, click "Network Access"
   - Click "Add IP Address"
   - For development, you can allow access from anywhere by clicking "Allow Access from Anywhere" (0.0.0.0/0)
   - For production, you should restrict access to your application's IP address
   - Click "Confirm"

5. **Get Your Connection String**
   - In the left sidebar, click "Database"
   - Click "Connect"
   - Choose "Connect your application"
   - Copy the connection string

6. **Update Your Environment Variables**
   - Open the `.env` file in your project
   - Replace the placeholder MongoDB URI with your actual connection string:
     ```
     MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/bill-splitter?retryWrites=true&w=majority
     ```
   - Make sure to replace `your-username`, `your-password`, and `your-cluster` with your actual values

## MongoDB Schema

The Bill Splitter application uses the following MongoDB schema:

### Receipt Collection

```javascript
{
  _id: ObjectId,
  name: String,
  subtotal: Number,
  tax: Number,
  tip: Number,
  total: Number,
  images: [
    {
      _id: ObjectId,
      imageUrl: String,
      createdAt: Date
    }
  ],
  items: [
    {
      _id: ObjectId,
      name: String,
      price: Number,
      createdAt: Date
    }
  ],
  friends: [
    {
      _id: ObjectId,
      name: String,
      createdAt: Date
    }
  ],
  assignments: [
    {
      _id: ObjectId,
      itemId: ObjectId,
      friendName: String,
      createdAt: Date
    }
  ],
  createdAt: Date
}
```

## Troubleshooting

- **Connection Issues**: Make sure your IP address is whitelisted in MongoDB Atlas.
- **Authentication Errors**: Double-check your username and password in the connection string.
- **Data Not Showing Up**: Ensure your application is using the correct database and collection names. 