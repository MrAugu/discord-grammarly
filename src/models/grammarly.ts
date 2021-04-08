import mongoose, { Schema, Document } from "mongoose";

export interface GrammarlyDocument extends Document {
  id: string;
  content: string;
  respose: string;
}

const grammarlySchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  content: {
    type: String,
    requied: true,
    unique: true
  },
  response: {
    type: String,
    required: true
  }
});

export const GrammarlyModel = mongoose.model("GrammarlyResponses", grammarlySchema);