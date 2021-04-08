import { Message } from "discord.js";

export interface DiscordInfo {
  tickEmoji: string;
  crossEmoji: string;
  owner_id?: string;
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