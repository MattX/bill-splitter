import { connectToDatabase } from '../lib/mongodb';
import { Receipt, Friend } from '../lib/models';

async function migrateFriends() {
  try {
    console.log('Starting friend migration...');
    
    // Connect to the database
    await connectToDatabase();
    
    // Get all friends
    const friends = await Friend.find();
    console.log(`Found ${friends.length} friends to migrate`);
    
    if (friends.length === 0) {
      console.log('No friends to migrate. Exiting...');
      return;
    }
    
    // Get all receipts
    const receipts = await Receipt.find();
    console.log(`Found ${receipts.length} receipts`);
    
    if (receipts.length === 0) {
      console.log('No receipts found. Creating a new receipt for friends...');
      
      // Create a new receipt to store friends
      const newReceipt = new Receipt({
        name: 'Migration Receipt',
        subtotal: 0,
        tax: 0,
        tip: 0,
        total: 0,
        friends: friends.map(friend => ({
          name: friend.name,
          createdAt: friend.createdAt
        }))
      });
      
      await newReceipt.save();
      console.log('Created new receipt with friends');
    } else {
      // Add friends to the first receipt
      const firstReceipt = receipts[0];
      
      // Check which friends are already in the receipt
      const existingFriendNames = firstReceipt.friends.map((f: any) => f.name);
      const newFriends = friends.filter(friend => !existingFriendNames.includes(friend.name));
      
      if (newFriends.length > 0) {
        console.log(`Adding ${newFriends.length} new friends to the first receipt`);
        
        // Add new friends to the receipt
        firstReceipt.friends.push(...newFriends.map(friend => ({
          name: friend.name,
          createdAt: friend.createdAt
        })));
        
        await firstReceipt.save();
        console.log('Added friends to the first receipt');
      } else {
        console.log('All friends already exist in the first receipt');
      }
    }
    
    // Update assignments to use friend names instead of IDs
    console.log('Updating assignments to use friend names...');
    
    for (const receipt of receipts) {
      let assignmentsUpdated = false;
      
      // Create a map of friend IDs to names
      const friendIdToName = new Map();
      receipt.friends.forEach((friend: any) => {
        friendIdToName.set(friend._id.toString(), friend.name);
      });
      
      // Update assignments
      receipt.assignments.forEach((assignment: any) => {
        const friendId = assignment.friendId?.toString();
        if (friendId && friendIdToName.has(friendId)) {
          assignment.friendName = friendIdToName.get(friendId);
          delete assignment.friendId;
          assignmentsUpdated = true;
        }
      });
      
      if (assignmentsUpdated) {
        await receipt.save();
        console.log(`Updated assignments in receipt ${receipt._id}`);
      }
    }
    
    console.log('Friend migration completed successfully');
    
    // Optionally, you can uncomment the following line to delete the Friend collection
    // await Friend.deleteMany({});
    // console.log('Deleted the Friend collection');
    
  } catch (error) {
    console.error('Error during friend migration:', error);
  }
}

// Run the migration
migrateFriends(); 