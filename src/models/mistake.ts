import mongoose, { Schema, Document } from "mongoose";

export interface MistakeDocument extends Document {
  user_id: string;
  grammarly_id: string;
  link: string;
}

const mistakeSchema = new Schema({
  user_id: {
    type: String,
    required: true,
    unique: true
  },
  grammarly_id: {
    type: String,
    requied: true
  },
  link: {
    type: String,
    required: true
  }
});

export const MistakeModel = mongoose.model("UserMistakes", mistakeSchema);