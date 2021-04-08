import mongoose, { Schema, Document } from "mongoose";

export interface UserDocument extends Document {
  id: string;
  insights: boolean;
  essential: boolean;
  random: boolean;
  excludedIn: string[];
}

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  insights: {
    type: Boolean,
    required: true,
    default: false
  },
  essential: {
    type: Boolean,
    required: true,
    default: true
  },
  random: {
    type: Boolean,
    required: true,
    default: true
  },
  excludedIn: {
    type: Array,
    required: true,
    default: []
  }
});

export const UserModel = mongoose.model("Users", userSchema);