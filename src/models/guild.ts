import mongoose, { Schema, Document } from "mongoose";

export interface Excluded {
  users?: string[];
  roles?: string[];
  channels?: string[]
} 

export interface GuildDocument extends Document {
  id: string;
  excluded: Excluded;
  prefix: string;
}

const guildSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  excluded: {
    type: Object,
    requied: false,
    default: {}
  },
  prefix: {
    type: String,
    required: false,
    default: process.env.PREFIX
  }
});

export const GuildModel = mongoose.model<GuildDocument>("Guilds", guildSchema);