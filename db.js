const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://debjit:katana007@cluster0.kd9pbws.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster0"
    );

    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
