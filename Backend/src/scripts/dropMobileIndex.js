/**
 * One-time script — drops the stale unique index on profile.mobile.
 * Run once:  node src/scripts/dropMobileIndex.js
 * Safe to delete this file afterwards.
 */
import mongoose from "mongoose";
import dotenv  from "dotenv";
dotenv.config();

await mongoose.connect(process.env.MONGO_URI || process.env.DB_URI || process.env.MONGODB_URI);

const db   = mongoose.connection.db;
const col  = db.collection("users");

const indexes = await col.indexes();
const hasBadIndex = indexes.some((idx) => idx.name === "profile.mobile_1");

if (hasBadIndex) {
  await col.dropIndex("profile.mobile_1");
  console.log("✅  Dropped stale index: profile.mobile_1");
} else {
  console.log("ℹ️   Index profile.mobile_1 not found — nothing to drop.");
}

await mongoose.disconnect();
process.exit(0);
