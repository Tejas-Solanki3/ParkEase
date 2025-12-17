import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const cleanupDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the users collection
    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get all indexes
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:', indexes);

    // Drop the username index if it exists
    try {
      await collection.dropIndex('username_1');
      console.log('✅ Dropped username_1 index');
    } catch (err) {
      console.log('ℹ️  username_1 index does not exist or already dropped');
    }

    // Optionally: Clear all users (uncomment if you want to start fresh)
    // const result = await collection.deleteMany({});
    // console.log(`🗑️  Deleted ${result.deletedCount} users`);

    // Get updated indexes
    const updatedIndexes = await collection.indexes();
    console.log('\n📋 Updated indexes:', updatedIndexes);

    console.log('\n✅ Database cleanup completed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

cleanupDatabase();
