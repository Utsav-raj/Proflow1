const mongoose = require('mongoose');

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('CRITICAL ERROR: MONGODB_URI environment variable is completely empty or undefined! Please add it to your Render Environment Variables.');
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error detail: ${error.message}`);
    // Wait for console stream to flush before exiting
    setTimeout(() => process.exit(1), 1000);
  }
};

module.exports = connectDB;
