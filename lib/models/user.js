import mongoose, { models, Schema } from "mongoose";

const UserSchema = new Schema(
  {
    email: { type: String, unique: true },
    name: { type: String, required: true },
  },
  { timestamps: true }
);

export const UserModel =
  mongoose.models.User || mongoose.model("User", UserSchema);
