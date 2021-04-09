import { Client, Collection, Message, MessageEmbed, Snowflake, ClientOptions, ReactionCollector, ReactionManager, MessageReaction, User, StringResolvable } from "discord.js";
import { Command } from "./Command";
import Config from "./Configuration";
import { promisify } from "util";
import { Directive } from "./Configuration";
import { sep } from "path";
import DetectLanguage from "detectlanguage";
import { createCipheriv, createDecipheriv } from "crypto";
import Grammarly from "./Grammarly";

export interface Emoji {
  name: string;
  id?: string;
  animated?: boolean;
  raw: string;
} 

export default class DiscordClient extends Client {
  public commands:  Collection<string | undefined, Command>;
  public config: Config;
  public aliases: Collection<string | undefined, string>;
  public isFullyReady: boolean;
  public grammarly: Grammarly;
  public detectLanguage: DetectLanguage;
  #encryptionAlgorithm: string;
  private orderedDirectives: Directive[];

  public constructor(options?: ClientOptions) {
    super(options);

    this.commands = new Collection();
    this.config = {
      discord: {
        tickEmoji: process.env.TICK || "✅",
        crossEmoji: process.env.CROSS || "❌", 
        owner_id: process.env.OWNER_ID,
        redWarning: process.env.RED_WARNING || "🔴",
        blueWarning: process.env.BLUE_WARNING || "🔵",
        greenWarning: process.env.GREEN_WARNING || "🟢",
        purpleWarning: process.env.PURPLE_WARNING || "🟣",
        loader: process.env.LOADER || "🛰️"
      },
      directives: [{
        level: 0,
        name: "User",
        test: (message: Message) => true,
        guildOnly: false
      }, {
        level: 1,
        name: "Moderator",
        test: (message: Message) => message.member ? (message.member.permissionsIn(message.channel).has("BAN_MEMBERS") || message.member.permissionsIn(message.channel).has("MANAGE_GUILD") || message.member.permissionsIn(message.channel).has("KICK_MEMBERS") || message.member.permissionsIn(message.channel).has("MANAGE_MESSAGES")) : false,
        guildOnly: true
      }, {
        level: 2,
        name: "Administrator",
        test: (message: Message) => message.member ? message.member.permissionsIn(message.channel).has("BAN_MEMBERS") : false,
        guildOnly: true
      }, {
        level: 3,
        name: "Owner",
        test: (message: Message) => message.author.id === message.guild?.ownerID,
        guildOnly: true
      }]
    };
    this.aliases = new Collection();
    this.isFullyReady = false;
    this.orderedDirectives = this.config.directives.sort((dOne: Directive, dTwo: Directive) => dOne.level < dTwo.level ? -1 : 1);
    this.grammarly = new Grammarly(this);
    this.detectLanguage = new DetectLanguage(process.env.DETECT_LANGUAGE ? process.env.DETECT_LANGUAGE : "None");
    this.#encryptionAlgorithm = "aes-256-cbc";
  }

  public wait(): (ms: number) => Promise<void> {
    return promisify(setTimeout);
  };

  public async awaitReply(msg: Message, content: string | MessageEmbed, limit: number = 60000): Promise<Message | undefined> {
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

  public async awaitReactionReply (message: Message, emote: string, limit: number = 60000, max: number = 1): Promise<MessageReaction | undefined> {
    const parsedEmoji: Emoji = this.parseEmoji(emote);
    const filter: (reaction: MessageReaction, user: User) => boolean = (reaction, user) => reaction.emoji.name === parsedEmoji.name && user.id == message.author.id;

    try {
      const collected: Collection<string, MessageReaction> = await message.awaitReactions(filter, {
        max: max,
        time: limit,
        errors: ["time"]
      });
      return collected.first();
    } catch (e) {
      return undefined;
    }
  }

  public parseEmoji (emoji: string): Emoji {
    let cleanEmoji: string | string[] = emoji.replace(/>/g, "").replace(/</g, "").replace(/:/g, " ");
    cleanEmoji = cleanEmoji.trim();
    cleanEmoji = cleanEmoji.split(" ");

    if (cleanEmoji.length < 2) return {
      raw: emoji,
      name: emoji
    };
    else if (cleanEmoji.length < 3) return {
      name: cleanEmoji[0],
      id: cleanEmoji[1],
      animated: false,
      raw: emoji
    }
    else return {
      name: cleanEmoji[1],
      id: cleanEmoji[2],
      animated: true,
      raw: emoji
    };
  } 

  public checkPermission(message: Message): number {
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

  public loadCommand (cmdPath: string, cmdName: string): string | boolean {
    try {
      const props: Command = new (require(`${cmdPath}${sep}${cmdName}`).default)(this);
      props.info.location = cmdPath;
      props.config.aliases.forEach((alias: string) => {
        this.aliases.set(alias, props.info.name);
      });
      this.commands.set(props.info.name, props);
      return false;
    } catch (e) {
      return `Cannot load the ${cmdName} command.`;
    }
  }

  public async unloadCommand (commandPath: string, commandName: string): Promise<string | boolean> {
    let command: Command | undefined;
    if (this.commands.has(commandName)) {
      command = this.commands.get(commandName);
    } else if (this.aliases.has(commandName)) {
      command = this.commands.get(this.aliases.get(commandName));
    }
    if (!command) return `The command \`${commandName}\` doesn't seem to exist, nor is it an alias. Try again!`;

    delete require.cache[require.resolve(`${commandPath}${sep}${commandName}.js`)];
    return false;
  }

  public getLocale (content: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.detectLanguage.detectCode(content).then(function (result) {
        resolve(result);
      }).catch(() => reject(null));
    });
  }

  public getCleanLength (content: string): number {
    const charSet: string[] = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm".split("");
    var length: number = 0;

    for (const character of content.split("")) {
      if (charSet.includes(character)) length++;
      else continue;
    }

    return length;
  }

  public encryptContent (content: string): string {
    const iv = Buffer.from(process.env.CRYPTO_IV ? process.env.CRYPTO_IV : "jeusheo39aoe9awq");
    const chiper = createCipheriv(this.#encryptionAlgorithm, Buffer.from(process.env.CRYPTO_KEY ? process.env.CRYPTO_KEY : "heiwjsbh39sjehcbwidoehwm38636472"), iv);
    const encrypted = Buffer.concat([chiper.update(Buffer.from(content)), chiper.final()]);
    return JSON.stringify({
      iv: iv.toString("hex"),
      data: encrypted.toString("hex")
    });
  }

  public decryptContent (content: string): string {
    const crypted = JSON.parse(content);
    const dechiper = createDecipheriv(this.#encryptionAlgorithm, process.env.CRYPTO_KEY ? process.env.CRYPTO_KEY : "heiwjsbh39sjehcbwidoehwm38636472", Buffer.from(crypted.iv, "hex"));
    const decrypted = Buffer.concat([dechiper.update(Buffer.from(crypted.data, "hex")), dechiper.final()]);
    return decrypted.toString();
  }

  public btoa (content: string): string {
    return Buffer.from(content).toString("base64");
  }

  public atob (base: string): string {
    return Buffer.from(base, "base64").toString();
  }

  public checkPrivilege (message: Message): number {
    if (message.author.id === process.env.OWNER_ID) return 2;
    if (process.env.ADMINS && process.env.ADMINS.split(",").includes(message.author.id)) return 1;
    return 0;
  }

  public isMessagePrefixed (content: string): boolean {
    const charSet = "!$^&`~%^&*()-_=+/?.,><".split("");
    if (charSet.includes(content[0]) || charSet.includes(content[1]) || charSet.includes(content[2])) return true;
    else return false;
  }
  
  public async deliverMessage (user: User, content: StringResolvable | MessageEmbed): Promise<Message | undefined> {
    try {
      return await user.send(content);
    } catch (e) {
      return undefined;
    }
  }
}