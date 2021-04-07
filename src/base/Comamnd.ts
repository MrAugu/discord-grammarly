import { Client, Message } from "discord.js";
import { InformationOptions, ConfigurationOptions, CommandOptions } from "./Command";

export class Command {
  public info: InformationOptions;
  public config: ConfigurationOptions;
  public run(message: Message): void {
    return;
  };
  constructor (client: Client, options: CommandOptions);

  constructor (client: Client, options: CommandOptions) {
    this.info = {
      name: options.info.name,
      description: options.info.description,
      category: options.info.category,
      usage: options.info.usage || null
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