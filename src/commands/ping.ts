import { Command } from "../base/Comamnd";
import DiscordClient from "../base/Client";
import { Message, StringResolvable } from "discord.js";

abstract class Ping extends Command {
  constructor(client: DiscordClient) {
    super(client, {
      info: {
        name: "ping",
        description: "Responds you with the latency of a message.",
        category: "General",
        usage: null
      },
      config: {
        enabled: true,
        aliases: ["pong"],
        privilege: 0,
        permission: 0,
        operationPermissions: ["SEND_MESSAGES", "EMBED_LINKS"]
      }
    });
  }

  async run (message: Message, args: string[], reply: (content: StringResolvable) => Promise<Message>) {
    const replyMessage: Message = await reply("Hello!");
    replyMessage.edit(`*${replyMessage.createdTimestamp - message.createdTimestamp}ms*`);
  }
}

export default Ping;