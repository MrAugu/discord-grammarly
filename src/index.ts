import * as dotenv from "dotenv";
import { sep } from "path";
// import { Grammarly } from "@stewartmcgown/grammarly-api";

var pathArray: string[] = [];
pathArray = __dirname.split(sep);
pathArray.pop();
pathArray.push(".env");

dotenv.config({
  path: pathArray.join(sep)
});
