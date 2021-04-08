import DiscordClient from "../base/Client";
import { Message, StringResolvable } from "discord.js";

export default class MessageEvent {
  client: DiscordClient;

  constructor (client: DiscordClient) {
    this.client = client;
  }

  async run(message: Message): Promise<any> {
    const reply: (content: StringResolvable) => Promise<Message> = async (content: StringResolvable) => {
      return await message.channel.send(content);
    };

    if (message.author.bot) return;
    if (!message.guild) return reply(`${this.client.config.discord.crossEmoji} You cannot use the Grammarly bot in the DMs, however, you can invite it:\n> <https://discord.com/oauth2/authorize?client_id=${this.client.user ? this.client.user.id : process.env.CLIENT_ID}&permissions=67628112&scope=applications.commands%20bot>`);

    console.log(this.client.getCleanLength(message.content));
  }
}