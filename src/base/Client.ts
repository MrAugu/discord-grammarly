import { Client, Collection, Message, MessageEmbed, Snowflake, ClientOptions } from "discord.js";
import { Command } from "./Command";
import Config from "./Configuration";
import { promisify } from "util";
import { Directive } from "./Configuration";
import { sep } from "path";
import { Grammarly } from "@stewartmcgown/grammarly-api";
import DetectLanguage from "detectlanguage";
import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

export default class DiscordClient extends Client {
  commands:  Collection<string | undefined, Command>;
  config: Config;
  aliases: Collection<string | undefined, string>;
  isFullyReady: boolean;
  grammarly: Grammarly;
  detectLanguage: DetectLanguage;
  #encryptionAlgorithm: string;
  private orderedDirectives: Directive[];

  constructor(options?: ClientOptions) {
    super(options);

    this.commands = new Collection();
    this.config = {
      discord: {
        tickEmoji: "✅",
        crossEmoji: "❌",
        owner_id: process.env.OWNER_ID
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
    this.grammarly = new Grammarly();
    this.detectLanguage = new DetectLanguage(process.env.DETECT_LANGUAGE ? process.env.DETECT_LANGUAGE : "None");
    this.#encryptionAlgorithm = "aes-256-cbc"; 
  }

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

  loadCommand (cmdPath: string, cmdName: string): string | boolean {
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

  async unloadCommand (commandPath: string, commandName: string): Promise<string | boolean> {
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

  getLocale (content: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.detectLanguage.detectCode(content).then(function (result) {
        resolve(result);
      }).catch(() => reject(null));
    });
  }

  getCleanLength (content: string): number {
    const charSet: string[] = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm".split("");
    var length: number = 0;

    for (const character of content.split("")) {
      if (charSet.includes(character)) length++;
      else continue;
    }

    return length;
  }

  encryptContent (content: string): string {
    const iv = Buffer.from("jeusheo39aoe9awq");
    const chiper = createCipheriv(this.#encryptionAlgorithm, Buffer.from(process.env.CRYPTO_KEY ? process.env.CRYPTO_KEY : "heiwjsbh39sjehcbwidoehwm38636475"), iv);
    const encrypted = Buffer.concat([chiper.update(Buffer.from(content)), chiper.final()]);
    return JSON.stringify({
      iv: iv.toString("hex"),
      data: encrypted.toString("hex")
    });
  }

  decryptContent (content: string): string {
    const crypted = JSON.parse(content);
    const dechiper = createDecipheriv(this.#encryptionAlgorithm, process.env.CRYPTO_KEY ? process.env.CRYPTO_KEY : "heiwjsbh39sjehcbwidoehwm3863647", Buffer.from(crypted.iv, "hex"));
    const decrypted = Buffer.concat([dechiper.update(Buffer.from(crypted.data, "hex")), dechiper.final()]);
    return decrypted.toString();
  }

  btoa (content: string): string {
    return Buffer.from(content).toString("base64");
  }

  atob (base: string): string {
    return Buffer.from(base, "base64").toString();
  }

  checkPrivilege (message: Message): number {
    if (message.author.id === process.env.OWNER_ID) return 2;
    if (process.env.ADMINS && process.env.ADMINS.split(",").includes(message.author.id)) return 1;
    return 0;
  }
}