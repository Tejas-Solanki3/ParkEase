import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const clearUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Delete all users
    const result = await collection.deleteMany({});
    console.log(`🗑️  Deleted ${result.deletedCount} users from database`);

    // Drop all indexes except _id
    const indexes = await collection.indexes();
    console.log('\n📋 Current indexes:', indexes.map(i => i.name));

    for (const index of indexes) {
      if (index.name !== '_id_') {
        try {
          await collection.dropIndex(index.name);
          console.log(`✅ Dropped index: ${index.name}`);
        } catch (err) {
          console.log(`⚠️  Could not drop index ${index.name}: ${err.message}`);
        }
      }
    }

    // Recreate only the email index
    await collection.createIndex({ email: 1 }, { unique: true });
    console.log('✅ Created email index');

    const finalIndexes = await collection.indexes();
    console.log('\n📋 Final indexes:', finalIndexes.map(i => i.name));

    console.log('\n✨ Database is now clean! You can register new users.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

clearUsers();
