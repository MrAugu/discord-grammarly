import * as dotenv from "dotenv";
import { sep } from "path";

var pathArray: string[] = [];
pathArray = __dirname.split(sep);
pathArray.pop();
pathArray.push(".env");

dotenv.config({
  path: pathArray.join(sep)
});
