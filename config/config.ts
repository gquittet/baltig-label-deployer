import type { Infer } from "@vinejs/vine/types";
import vine from "@vinejs/vine";

const schema = vine.object({
  host: vine
    .string()
    .url({ protocols: ["https"] })
    .transform(url => url.replace(/\/$/, "")),
  token: vine.string(),
  project: vine.string(),
});

export let env!: Infer<typeof schema>;

export const load = async (flags: Record<string, unknown>) => {
  env = await vine.validate({ schema, data: flags });
};
