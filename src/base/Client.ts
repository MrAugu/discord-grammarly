import { Client, Collection } from "discord.js";
import { Command } from "./Command";
import { Config } from "./Config";

class DiscordClient extends Client {
  commands:  Collection<string, Command>;
  config: Config;
} 