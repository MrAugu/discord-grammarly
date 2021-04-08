import DiscordClient from "../base/Client";

export default class ReadyEvemt {
  client: DiscordClient;
  
  constructor (client: DiscordClient) {
    this.client = client;
  }

  run(): void {
    console.log(`Bot reached the ready state.`);
    this.client.isFullyReady = true;
  }
}