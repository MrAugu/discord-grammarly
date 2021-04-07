import { Client, Collection, Message, MessageEmbed, Snowflake } from "discord.js";
import { Command } from "./Command";
import Config from "./Config";
import { promisify } from "util";
import { Directive } from "./Config";

export default class DiscordClient extends Client {
  commands:  Collection<string, Command>;
  config: Config;
  aliases: Collection<string, string>;
  orderedDirectives: Directive[];
  // const orderedDirectives: Directive[] = this.config.directives.sort((dOne: Directive, dTwo: Directive) => dOne.level < dTwo.level ? 1 : -1);

  wait(): (ms: number) => Promise<void> {
    return promisify(setTimeout);
  };

  async awaitReply(msg: Message, content: string | MessageEmbed, limit: number = 60000): Promise<Message | undefined> {
    const filter: (m: Message) => boolean = m => m.author.id === msg.author.id;
    await msg.channel.send(content);
    try {
      const collected: Collection<Snowflake, Message> = await msg.channel.awaitMessages(filter, {
        max: 1,
        time: limit,
        errors: ["time"]
      });
      return collected.first();
    } catch (e) {
      return undefined;
    }
  }

  checkPermission(message: Message): number {
    let level: number = 0;
    for (const directive of this.orderedDirectives) {
      if (directive.guildOnly && !message.guild) continue;
      if (directive.test(message)) {
        level = directive.level;
        continue;
      } else {
        break;
      }
    }
    return level;
  }

}