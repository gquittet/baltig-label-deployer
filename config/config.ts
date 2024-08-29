import process from "node:process";
import vine from "@vinejs/vine";

const schema = vine.object({
  GITLAB_ENDPOINT: vine
    .string()
    .url({ protocols: ["https"] })
    .transform(url => {
      const baseUrl = url.replace(/\/$/, "");
      return `${baseUrl}/api/graphql`;
    }),
  GITLAB_TOKEN: vine.string(),
  PROJECT_PATH: vine.string(),
  TZ: vine.string().parse(value => (!value ? "TZ" : value)),
});

const env = await vine.validate({ schema, data: process.env });

export default env;
