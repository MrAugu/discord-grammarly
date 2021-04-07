import { Message } from "discord.js";

export interface DiscordInfo {
  tickEmoji: string;
  crossEmoji: string;
  owner_id: string;
}

export interface Directive {
  level: number;
  name: string;
  test(message: Message): number;
}

export default interface Config {
  discord: DiscordInfo,
  directives: Directive[];
}