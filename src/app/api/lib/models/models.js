import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  email: String,
  question: String,
  answer: String,
});

const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
