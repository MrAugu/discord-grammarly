import mongoose, { Schema, Document } from "mongoose";

export interface LanguageDocument extends Document {
  content: string;
  language: string;
}

const languageSchema = new Schema({
  content: {
    type: String,
    requied: true,
    unique: true
  },
  language: {
    type: String,
    required: true
  }
});

export const LanguageModel = mongoose.model<LanguageDocument>("Languages", languageSchema);