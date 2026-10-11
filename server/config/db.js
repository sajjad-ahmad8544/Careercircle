const mongoose = require("mongoose");
module.exports = async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/careercircle",
  );
  console.log(" MongoDB connected");
};
