# Migration Scripts

This directory contains scripts for migrating data between different database schemas.

## Friend Migration

The `migrate-friends.ts` script migrates friends from a separate collection to being inlined in the receipt documents.

### How to Run

```bash
npm run migrate:friends
```

### What It Does

1. Connects to the MongoDB database
2. Retrieves all friends from the Friend collection
3. Adds these friends to the first receipt in the database (or creates a new receipt if none exist)
4. Updates all assignments to use friend names instead of friend IDs
5. Optionally, you can uncomment the line to delete the Friend collection after migration

### Important Notes

- This script should be run only once after updating the schema to inline friends in receipts
- Make sure to backup your database before running this script
- After running this script, you can safely delete the Friend collection if desired

## Troubleshooting

If you encounter any issues during migration:

1. Check the console output for error messages
2. Ensure your MongoDB connection string is correct in your environment variables
3. Make sure you have the necessary permissions to read from and write to the database 