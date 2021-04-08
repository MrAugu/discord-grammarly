import { Message, Client } from "discord.js";

export interface InformationOptions {
  name: string;
  description: string;
  category: string;
  usage: string | null;
  location: string | null;
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
};

export interface Command {
  public info: InformationOptions;
  public config: ConfigurationOptions;
  public run(message: Message): void;
};