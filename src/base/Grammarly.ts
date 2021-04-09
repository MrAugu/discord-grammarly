import DiscordClient from "../base/Client";
import { Grammarly as GrammarlyAPI } from "@stewartmcgown/grammarly-api";
import { Message } from "discord.js";
import { GuildDocument } from "../models/guild";
import { UserDocument } from "../models/user";
import * as _ from "lodash";

export default class Grammarly {
  public client: DiscordClient;
  public api: GrammarlyAPI;

  public constructor (client: DiscordClient) {
    this.client = client;
    this.api = new GrammarlyAPI();
  }

  public async fire (message: Message, settings: GuildDocument | null, preferences: UserDocument | null): Promise<any> {
    if (!settings || !preferences) return; 
    if (preferences.excluded) return;
    if (preferences.excludedIn.includes(message.guild ? message.guild.id : "*")) return;
    if (settings.excluded.users?.length ? settings.excluded.users.includes(message.author.id) : false) return;
    if (settings.excluded.channels?.length ? settings.excluded.channels.includes(message.channel.id) : false) return;
    if (_.intersection(message.member?.roles.cache.map(r => r.id), settings.excluded.roles ? settings.excluded.roles : []).length > 0) return;

    console.log("Passed settings & preferences.");
  }

  public encodeContentIdentifier (content: string): string {
    const encryptedJson: string = this.client.encryptContent(content);
    return this.client.btoa(encryptedJson);
  }

  public decodeContentIdentifier (identifier: string) {
    const jsonString: string = atob(identifier);
    return this.client.decryptContent(jsonString);
  }
}