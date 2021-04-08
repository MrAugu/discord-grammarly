import { Message, Client } from "discord.js";
import { InformationOptions, ConfigurationOptions, Command as CommandInterface, CommandOptions } from "./Command";

export abstract class Command implements CommandInterface {
  public info: InformationOptions;
  public config: ConfigurationOptions;
  public abstract run(message: Message): void;

  constructor (client: Client, options: CommandOptions) {
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
      inputFormat: options.config.inputFormat,
      privilege: options.config.privilege || 0,
      permission: options.config.permission || 0,
      operationPermissions: options.config.operationPermissions
    };
  }
}