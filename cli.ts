#!/usr/bin/env node
import meow from "meow";
import app from "./index.js";

const cli = meow(
  `
    Usage
      $ baltig-label-deployer <input>

    Options
      --deploy, -d Add the "Deployed" label
      --milestone, -m Move issues to the new milestone

    Examples
      $ baltig-label-deployer --deploy
      $ baltig-label-deployer --milestone
`,
  {
    importMeta: import.meta, // This is required
    flags: {
      deploy: {
        type: "boolean",
        shortFlag: "d",
      },
      milestone: {
        type: "boolean",
        shortFlag: "m",
      },
    },
  },
);

app(cli.flags);
