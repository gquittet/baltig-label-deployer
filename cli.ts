#!/usr/bin/env node
import meow from "meow";
import { load } from "#config/config";

process.env.TZ = "UTC";

const isFlagRequired = (flags: Record<string, unknown>) => {
  if (Object.keys(flags).length === 3) {
    return false;
  }
  return !flags.env;
};

const cli = meow(
  `
    Usage
      $ baltig-label-deployer <input>


    Configuration
      --host    The endpoint to make calls (ex: https://gitlab.com)
      --token   The access token to make queries
      --project The project root path

      OR

      --env Load configuration from environment variables

    Options
      --deploy, -d    Add the "Deployed" label
      --milestone, -m Move issues to the new milestone

    Examples
    $ baltig-label-deployer --host https://gitlab.com --token my_token --project my_project --deploy
    $ baltig-label-deployer --host https://gitlab.com --token my_token --project my_project --milestone
    $ baltig-label-deployer --env --deploy
    $ baltig-label-deployer --env --milestone
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
      host: {
        type: "string",
        isRequired: isFlagRequired,
      },
      token: {
        type: "string",
        isRequired: isFlagRequired,
      },
      project: {
        type: "string",
        isRequired: isFlagRequired,
      },
      env: {
        type: "boolean",
      },
    },
  },
);

if (!cli.flags.deploy && !cli.flags.milestone) {
  process.stdout.write(cli.help);
  process.exit(0);
}

if (cli.flags.env) {
  await load({
    host: process.env.GITLAB_ENDPOINT,
    token: process.env.GITLAB_TOKEN,
    project: process.env.PROJECT_PATH,
  });
} else {
  await load(cli.flags);
}

const app = await import("./index.js");
await app.default(cli.flags);
