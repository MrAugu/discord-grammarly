import DiscordClient from "../base/Client";
import { Message, StringResolvable } from "discord.js";
import { GuildModel } from "../models/guild";
import { UserModel } from "../models/user";

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

    let guildSettings = await GuildModel.findOne({ id: message.guild.id });
    if (!guildSettings) {
      guildSettings = new GuildModel({
        id: message.guild.id,
        excluded: {
          roles: [],
          channels: [],
          users: []
        },
        prefix: process.env.PREFIX 
      });
      await guildSettings.save();
      guildSettings = await GuildModel.findOne({ id: message.guild.id });
      //message.guild.settings = guildSettings;
    }
    // console.log(message.guild.settings);
  }
}