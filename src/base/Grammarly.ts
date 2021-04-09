import DiscordClient, { Emoji } from "../base/Client";
import { Grammarly as GrammarlyAPI } from "@stewartmcgown/grammarly-api";
import { Message, MessageEmbed } from "discord.js";
import { GuildDocument } from "../models/guild";
import { UserDocument } from "../models/user";
import * as _ from "lodash";
import { LanguageModel, LanguageDocument } from "../models/language";
import { GrammarlyModel, GrammarlyDocument } from "../models/grammarly";
import GrammarlyReply from "./GrammarlyTypes";

export default class Grammarly {
  public client: DiscordClient;
  public api: GrammarlyAPI;
  public keepItUpEmbed: MessageEmbed;

  public constructor (client: DiscordClient) {
    this.client = client;
    this.api = new GrammarlyAPI();

    this.keepItUpEmbed = new MessageEmbed()
      .setAuthor(this.client.user?.tag, this.client.user?.displayAvatarURL())
      .setColor("#198754")
      .setDescription("A");
  }

  public generateKeepItUpEmbed (): MessageEmbed {
    const positiveArray: string[] = [
      "👍 Keep it up with the perfect messages!",
      "🥰 Lovely writing. Let's keep it that way.",
      "👾 So good that you almost don't even need me anymore. Keep going.",
      "️🕸️🕸️ It's been a while since the last typing error, spider webs started growing around here.",
      "🎼 Your writing is music to my ears."
    ];
    return new MessageEmbed()
      .setColor("#198754")
      .setTitle("Writing better already!")
      .setDescription(positiveArray[Math.floor(Math.random() * positiveArray.length)])
      .setFooter("Grammarly", this.client.user?.displayAvatarURL())
      .setTimestamp();
  }

  public async fire (message: Message, settings: GuildDocument | null, preferences: UserDocument | null): Promise<any> {
    if (message.content.length > 1500) return console.log("Not supporting extending beyond 1500 characters.");
    if(this.client.isMessagePrefixed(message.content)) return;
    if (this.client.getCleanLength(message.content) < 10) return;
    if (!settings || !preferences) return; 
    if (preferences.excluded) return;
    if (preferences.excludedIn.includes(message.guild ? message.guild.id : "*")) return;
    if (settings.excluded.users?.length ? settings.excluded.users.includes(message.author.id) : false) return;
    if (settings.excluded.channels?.length ? settings.excluded.channels.includes(message.channel.id) : false) return;
    if (_.intersection(message.member?.roles.cache.map(r => r.id), settings.excluded.roles ? settings.excluded.roles : []).length > 0) return;

    const messageIdentifier: string = this.encodeContentIdentifier(message.content);
    const isEnglish: boolean = await this.isEnglish(message.content, messageIdentifier);
    if (!isEnglish) return;
    const grammarlyResponse: string = await this.getGrammarlyResponse(message.content, messageIdentifier);
    const response: GrammarlyReply = JSON.parse(grammarlyResponse);

    if (!response.alerts.length) return Math.floor(Math.random() * 100) > 97 ? this.client.deliverMessage(message.author, this.generateKeepItUpEmbed()) : null;
    
    let passing: boolean = false;

    const parsedEmoji: Emoji = this.client.parseEmoji(this.client.config.discord.redWarning);
    await message.react(parsedEmoji.id ? parsedEmoji.id : parsedEmoji.name);
    const answered = await this.client.awaitReactionReply(message, this.client.config.discord.redWarning, 30000, 1);
    if (!answered) {
      message.reactions.removeAll().catch(()=>{});
      passing = false;
    } else {
      message.reactions.removeAll().catch(()=>{});
      passing = true;
    }

    if (!passing) return;
    
    console.log(response.alerts.length);
    const alertEmbeds: MessageEmbed[] = [];
    for (const alert of response.alerts) {
      const colors = {
        "critial": "#dc3545",
        "advanced":  "#ffc107"
      };

    //   let alertContent: string = "";
    //   alertContent = message.content.substr(alert.highlightBegin - 100, alert.highlightBegin + 100);
    //   if (!alertContent.startsWith(message.content.split("").slice(0, 5).join(""))) alertContent = "..." + alertContent;
    //   if (!alertContent.endsWith(message.content.split("").slice(message.content.length - 4, message.content.length).join(""))) alertContent += "...";
    //   const alertRegex = new RegExp(alert.highlightText);
    //   alertContent = alertContent.replace(alertRegex, `~~${alert.highlightText.trim()}~~${alert.replacements.length ? ` ~~${alert.replacements.join(", ").trim()}~~` : ""}`);
    //   message.channel.send(alertContent);

    // From there on you can build a formatter and send the alerts to people's DMs.
    }
  }

  public encodeContentIdentifier (content: string): string {
    const encryptedJson: string = this.client.encryptContent(content);
    return this.client.btoa(encryptedJson);
  }

  public decodeContentIdentifier (identifier: string) {
    const jsonString: string = this.client.atob(identifier);
    return this.client.decryptContent(jsonString);
  }

  public async isEnglish (content: string, messageIdentifier: string): Promise<boolean> {
    let messageLanguage: LanguageDocument | null = await LanguageModel.findOne({ content: messageIdentifier });
    if (messageLanguage && messageLanguage.language === "en") return true;
    else if (messageLanguage && messageLanguage.language != "en") return false;
    else {
      const language: string | null = await this.client.getLocale(content);
      if (!language) return false;

      messageLanguage = new LanguageModel({
        content: messageIdentifier,
        language: language
      });
      await messageLanguage.save().catch(console.error);

      if (language === "en") return true;
      else return false;
    }
  }

  public async getGrammarlyResponse (content: string, identifier: string): Promise<string> {
    let grammarlyResponse: GrammarlyDocument | null = await GrammarlyModel.findOne({ content: identifier });
    if (grammarlyResponse) return this.decodeContentIdentifier(grammarlyResponse.response);
    else {
      const apiResponse = await this.api.analyse(content);
      const apiResponseJson = JSON.stringify(apiResponse);

      grammarlyResponse = new GrammarlyModel({
        id: Date.now().toString(36),
        content: identifier,
        response: this.encodeContentIdentifier(apiResponseJson)
      });
      await grammarlyResponse.save();

      return apiResponseJson;
    }
  }
}