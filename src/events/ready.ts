import DiscordClient from "../base/Client";

export default class ReadyEvent {
  client: DiscordClient;
  
  constructor (client: DiscordClient) {
    this.client = client;
  }

  run(): any {
    console.log(`Bot reached the ready state.`);
    this.client.isFullyReady = true;
  }
}