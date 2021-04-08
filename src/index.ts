import * as dotenv from "dotenv";
import { sep, parse, ParsedPath } from "path";
import DiscordClient from "./base/Client"; 
import klaw, { Item } from "klaw";
import { promisify } from "util";
import { connect } from "mongoose";
const readdir: (arg: string) => Promise<string[]> = promisify(require("fs").readdir);

var pathArray: string[] = [];
pathArray = __dirname.split(sep);
pathArray.pop();
pathArray.push(".env");

dotenv.config({
  path: pathArray.join(sep)
});

if (!process.env.DB_URL) throw new Error("A database url is required");
connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const client = new DiscordClient({
  ws: {
    intents: [
      "GUILDS",
      "GUILD_MESSAGES",
      "DIRECT_MESSAGES"
    ]
  }
});
export default client;

const init: () => Promise<void> = async () => {
  klaw("./dist/commands").on("data", (item: Item) => {
    const commandFile: ParsedPath = parse(item.path);
    if (!commandFile.ext || commandFile.ext !== ".js") return;
    const response: string | boolean = client.loadCommand(commandFile.dir, `${commandFile.name}${commandFile.ext}`);
    if (response) console.error(response);
  });

  const evtFiles: string[] = await readdir("./dist/events/");
  evtFiles.forEach((file) => {
    if (file.split(".")[1] !== "js") return;
    const eventName: string = file.split(".")[0];
    const event: any = new (require(`./events/${file}`).default)(client);
    client.on(eventName, (...args) => event.run(...args));
    delete require.cache[require.resolve(`./events/${file}`)];
  });

  client.login(process.env.TOKEN);
};

init();