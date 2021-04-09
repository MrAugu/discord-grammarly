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

// From there on you can build commands to change these settings.

const guildSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  excluded: {
    type: Object,
    requied: false,
    default: {
      roles: [],
      channels: [],
      users: []
    }
  },
  prefix: {
    type: String,
    required: false,
    default: process.env.PREFIX
  }
});

export const GuildModel = mongoose.model<GuildDocument>("Guilds", guildSchema);