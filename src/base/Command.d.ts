import { Message, Client } from "discord.js";

export interface InformationOptions {
  name: string;
  description: string;
  category: string;
  usage: string | null;
} 
  
export interface ConfigurationOptions {
  enabled: boolean;
  aliases: string[];
  inputFormat: string | null;
  privilege: number;
  permission: number;
  operationPermissions: string[];
}
  
export interface CommandOptions {
  info: InformationOptions;
  config: ConfigurationOptions;
}