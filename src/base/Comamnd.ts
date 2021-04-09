import { Message, StringResolvable } from "discord.js";
import { InformationOptions, ConfigurationOptions, Command as CommandInterface, CommandOptions } from "./Command";
import DiscordClient from "./Client";

export abstract class Command implements CommandInterface {
  public info: InformationOptions;
  public config: ConfigurationOptions;
  public client: DiscordClient;
  public abstract run(message: Message, args: string[], reply: (content: StringResolvable) => Promise<Message>): any;

  public constructor (client: DiscordClient, options: CommandOptions) {
    this.info = {
      name: options.info.name,
      description: options.info.description,
      category: options.info.category,
      usage: options.info.usage || null,
      location: null
    };

    this.config = {
      enabled: options.config.enabled,
      aliases: options.config.aliases,
      privilege: options.config.privilege || 0,
      permission: options.config.permission || 0,
      operationPermissions: options.config.operationPermissions
    };

    this.client = client;
  }
}