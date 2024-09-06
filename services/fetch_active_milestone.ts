import url from "node:url";
import vine from "@vinejs/vine";
import { env } from "#config/config";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const query = loadQuery(__dirname + "fetch_active_milestone.graphql");

const roundDay = (date: Date) => {
  let result = date;

  const funcs = ["setMilliseconds", "setHours", "setMinutes", "setSeconds"] as const;

  for (const func of funcs) {
    result = new Date(date[func](0));
  }
  return result;
};

const addDay = (date: Date, n = 0) => {
  return new Date(date.setDate(date.getDate() + n));
};

const schema = vine.object({
  data: vine.object({
    data: vine.object({
      group: vine.object({
        milestones: vine.object({
          nodes: vine
            .array(
              vine.object({
                id: vine
                  .string()
                  .regex(/^gid:\/\/gitlab\/Milestone\/\d+$/)
                  .transform(value => value.split("/").at(-1)!),
                title: vine.string(),
                dueDate: vine
                  .date()
                  .afterOrEqual("today")
                  .transform(value => roundDay(addDay(value, 1))),
              }),
            )
            .minLength(1)
            .maxLength(1),
        }),
      }),
    }),
  }),
});

export default async function fetchActiveMilestone() {
  const data = await executeQuery({
    operationName: "Find_Active_Milestone",
    query,
    variables: {
      date: new Date().toISOString(),
      projectPath: env.project,
    },
  });
  const body = await vine.validate({ schema, data });
  return body.data.data.group.milestones.nodes[0];
}
