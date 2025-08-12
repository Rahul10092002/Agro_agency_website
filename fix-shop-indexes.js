// This script fixes database indexes for the Shop model
// Run this once to remove conflicting indexes

const mongoose = require("mongoose");
require("dotenv").config();

async function fixShopIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const db = mongoose.connection.db;
    const collection = db.collection("shops");

    // Get current indexes
    const indexes = await collection.indexes();
    console.log(
      "Current indexes:",
      indexes.map((idx) => ({ name: idx.name, key: idx.key }))
    );

    const shopId = process.env.SHOP_ID || "default-shop";
    console.log("Using SHOP_ID:", shopId);

    // First, fix any shops that don't have a shopId
    const updateResult = await collection.updateMany(
      { $or: [{ shopId: null }, { shopId: { $exists: false } }] },
      { $set: { shopId: shopId } }
    );
    console.log(`Updated ${updateResult.modifiedCount} shops with shopId`);

    // Handle duplicate shops - keep only the latest one
    const shops = await collection
      .find({ shopId: shopId })
      .sort({ createdAt: -1 })
      .toArray();
    console.log(`Found ${shops.length} shops with shopId: ${shopId}`);

    if (shops.length > 1) {
      console.log("Removing duplicate shops, keeping the most recent one...");
      const keepShop = shops[0]; // Keep the first (latest) one
      const duplicateIds = shops.slice(1).map((shop) => shop._id);

      const deleteResult = await collection.deleteMany({
        _id: { $in: duplicateIds },
      });
      console.log(`Deleted ${deleteResult.deletedCount} duplicate shops`);
    }

    // Drop problematic indexes
    try {
      await collection.dropIndex("email_1");
      console.log("Dropped email_1 index");
    } catch (error) {
      console.log("email_1 index not found or already dropped");
    }

    try {
      await collection.dropIndex("shopId_1");
      console.log("Dropped shopId_1 index");
    } catch (error) {
      console.log("shopId_1 index not found or already dropped");
    }

    // Create the correct indexes
    await collection.createIndex({ shopId: 1 }, { unique: true });
    console.log("Created unique shopId index");

    await collection.createIndex({ shopId: 1, email: 1 }, { unique: true });
    console.log("Created compound shopId + email unique index");

    console.log("Index fix completed successfully!");
  } catch (error) {
    console.error("Error fixing indexes:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

fixShopIndexes();
