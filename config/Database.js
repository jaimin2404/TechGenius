const mongoose = require("mongoose");
const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log(`Database connected to ${mongoose.connection.name}`);
  } catch (error) {
    console.log(error.message);
  }
};
module.exports = dbConnect;
