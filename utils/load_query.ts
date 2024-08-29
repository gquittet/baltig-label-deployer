import fs from "node:fs";

export default (path: string) => fs.readFileSync(path).toString();
