import { Message, Client, PermissionString, StringResolvable } from "discord.js";

export interface InformationOptions {
  name: string;
  description: string;
  category: string;
  usage: string | null;
  location?: string | null;
}

export interface ConfigurationOptions {
  enabled: boolean;
  aliases: string[];
  privilege: number;
  permission: number;
  operationPermissions: PermissionString[];
}
  
export interface CommandOptions {
  info: InformationOptions;
  config: ConfigurationOptions;
};

export interface Command {
  info: InformationOptions;
  config: ConfigurationOptions;
  run(message: Message, args: string[], reply: (content: StringResolvable) => Promise<Message>): void;
};