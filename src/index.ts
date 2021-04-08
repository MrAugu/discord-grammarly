import * as dotenv from "dotenv";
import { sep } from "path";
// import { Grammarly } from "@stewartmcgown/grammarly-api";
import DiscordClient from "./base/Client"; 

var pathArray: string[] = [];
pathArray = __dirname.split(sep);
pathArray.pop();
pathArray.push(".env");

dotenv.config({
  path: pathArray.join(sep)
});

const client = new DiscordClient({
  ws: {
    intents: [
      "GUILDS",
      "GUILD_MESSAGES"
    ]
  }
});
export default client;

