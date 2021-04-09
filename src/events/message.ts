import DiscordClient from "../base/Client";
import { Message, PermissionString, StringResolvable } from "discord.js";
import { GuildModel, GuildDocument } from "../models/guild";
import { UserModel, UserDocument } from "../models/user";

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

    let guildSettings: GuildDocument | null = await GuildModel.findOne({ id: message.guild.id });
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
    }
    
    let userPreferences: UserDocument | null = await UserModel.findOne({ id: message.author.id });
    if (!userPreferences) {
      userPreferences = new UserModel({
        id: message.author.id,
        insights: false,
        essential: false,
        random: true,
        excludedIn: [],
        excluded: false
      });
      await userPreferences.save();
      userPreferences = await UserModel.findOne({ id: message.author.id });
    }

    console.log(userPreferences, guildSettings);
    
    const mentionHelp: RegExp = new RegExp(`^<@!?${this.client.user?.id}>( |)$`);
    if (message.content.match(mentionHelp)) {
      return reply(`I'm grammarly! A discord bot that helps you gain an insight on your writing.\nYou can call me by using \`${guildSettings?.prefix}\`!`);
    }

    if (message.guild && !message.member) await message.guild.members.fetch(message.author);

    let prefixType: string = "classic";
    let passingPrefix: boolean = false;
    var args: string[] = message.content.split(/ +/g) || [];
    var command: string | undefined;
    const prefixMention = new RegExp(`^<@!?${this.client.user?.id}>( |)$`);

    if (passingPrefix === false) {
      if (args[0].match(prefixMention)) {
        prefixType = "mention";
        passingPrefix = true;
        args.shift();
      }
    }

    if (message.content.indexOf(guildSettings ? guildSettings.prefix : "g!") !== 0 && passingPrefix !== true) return;
    else if (message.content.indexOf(guildSettings ? guildSettings.prefix : "g!") === 0) {
      command = args.shift();
      command = command ? command.toLowerCase() : undefined;
      command = command ? command.slice(guildSettings ? guildSettings.prefix.length : 2) : undefined;
    } else {
      command = args.shift();
      command = command ? command.toLowerCase() : undefined;
    }

    if (prefixType === "mention") {
      message.mentions.users.delete(this.client.user ? this.client.user.id : "*");
      if (message.mentions.members) message.mentions.members.delete(this.client.user ? this.client.user.id : "*");
    }

    const cmd = this.client.commands.get(command) || this.client.commands.get(this.client.aliases.get(command));

    if (!cmd) return;
    if (!cmd.config.enabled) return reply(`${this.client.config.discord.crossEmoji} This command is disabled.`);

    const permissionLevel = this.client.checkPermission(message);
    const privilegeLevel = this.client.checkPrivilege(message);

    if (cmd.config.permission > permissionLevel) return reply(`${this.client.config.discord.crossEmoji} You don't have sufficient permissions to run this command.`);
    if (cmd.config.privilege > privilegeLevel) return reply(`${this.client.config.discord.crossEmoji} You don't have sufficient privilege to run this command.`);

    const clientMemberPermissions: PermissionString[] | undefined = message.guild.me?.permissions.toArray();
    const missingPermissions: string[] = [];
    if (!clientMemberPermissions) return;
    for (const permission of cmd.config.operationPermissions) {
      if (!clientMemberPermissions.includes(permission)) missingPermissions.push(permission);
      else continue;
    }
    if (missingPermissions.length) return reply(`${this.client.config.discord.crossEmoji} I do not have required permissions to run this command. Please allow me access to \`${missingPermissions.join("\`, \`")}\` before running this command.`);

    try {
      await cmd.run(message, args, reply);
      console.log(`C: ${message.author.tag} ran ${cmd.info.name} in ${message.guild ? message.guild.name : "DMs"}.`);
    } catch (e: any) {
      console.error(e);
    }
  }
}