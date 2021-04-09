import DiscordClient from "../base/Client";
import { Grammarly as GrammarlyAPI } from "@stewartmcgown/grammarly-api";
import { Message } from "discord.js";
import { GuildDocument } from "../models/guild";
import { UserDocument } from "../models/user";
import * as _ from "lodash";
import { LanguageModel, LanguageDocument } from "../models/language";
import { GrammarlyModel, GrammarlyDocument } from "../models/grammarly";

export default class Grammarly {
  public client: DiscordClient;
  public api: GrammarlyAPI;

  public constructor (client: DiscordClient) {
    this.client = client;
    this.api = new GrammarlyAPI();
  }

  public async fire (message: Message, settings: GuildDocument | null, preferences: UserDocument | null): Promise<any> {
    if(this.client.isMessagePrefixed(message.content)) return;
    if (this.client.getCleanLength(message.content) < 10) return;
    if (!settings || !preferences) return; 
    if (preferences.excluded) return;
    if (preferences.excludedIn.includes(message.guild ? message.guild.id : "*")) return;
    if (settings.excluded.users?.length ? settings.excluded.users.includes(message.author.id) : false) return;
    if (settings.excluded.channels?.length ? settings.excluded.channels.includes(message.channel.id) : false) return;
    if (_.intersection(message.member?.roles.cache.map(r => r.id), settings.excluded.roles ? settings.excluded.roles : []).length > 0) return;

    const messageIdentifier = this.encodeContentIdentifier(message.content);
    const isEnglish = await this.isEnglish(message.content, messageIdentifier);
    if (!isEnglish) return;
    const grammarlyResponse = await this.getGrammarlyResponse(message.content, messageIdentifier);
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
    if (grammarlyResponse) return this.decodeContentIdentifier(grammarlyResponse.content);
    else {
      const apiResponse = this.api.analyse(content);
      const apiResponseJson = JSON.stringify(apiResponse);

      grammarlyResponse = new GrammarlyModel({
        id: Date.now().toString(36),
        content: identifier,
        response: this.encodeContentIdentifier(apiResponseJson)
      });

      return apiResponseJson;
    }
  }
}