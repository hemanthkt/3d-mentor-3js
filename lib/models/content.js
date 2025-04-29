import mongoose, { models, Schema } from "mongoose";
import { UserModel } from "./user";

const ContentSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
});

export const ContentModel =
  mongoose.models.Content || mongoose.model("Content", ContentSchema);
