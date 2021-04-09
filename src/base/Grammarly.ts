import DiscordClient from "../base/Client";
import { Grammarly as GrammarlyAPI } from "@stewartmcgown/grammarly-api";

export default class Grammarly {
  public client: DiscordClient;
  public api: GrammarlyAPI;

  public constructor (client: DiscordClient) {
    this.client = client;
    this.api = new GrammarlyAPI();
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