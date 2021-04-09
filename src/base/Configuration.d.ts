import { Message } from "discord.js";

export interface DiscordInfo {
  tickEmoji: string;
  crossEmoji: string;
  owner_id?: string;
  redWarning: string;
  blueWarning: string;
  greenWarning: string;
  purpleWarning: string;
  loader: string;
}

export interface Directive {
  level: number;
  name: string;
  guildOnly: boolean;
  test(message: Message): boolean;
}

export default interface Config {
  discord: DiscordInfo,
  directives: Directive[];
}