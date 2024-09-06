import type fetchActiveMilestone from "#services/fetch_active_milestone";
import url from "node:url";
import vine from "@vinejs/vine";
import { env } from "#config/config";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const query = loadQuery(__dirname + "fetch_mr_of_milestone.graphql");

const schema = vine.object({
  data: vine.object({
    data: vine.object({
      group: vine.object({
        mergeRequests: vine.object({
          nodes: vine.array(
            vine.object({
              iid: vine.string().regex(/^\d+$/),
              webPath: vine
                .string()
                .startsWith(`/${env.project}/`)
                .regex(/\/-\/merge_requests\/\d+/)
                .transform(value => value.slice(1)),
            }),
          ),
        }),
      }),
    }),
  }),
});

export default async function fetchMrOfMilestone(args: {
  milestone: Awaited<ReturnType<typeof fetchActiveMilestone>>;
}) {
  const data = await executeQuery({
    operationName: "Fetch_MR_Of_Milestone",
    query,
    variables: {
      projectPath: env.project,
      milestone: args.milestone.title,
    },
  });

  const body = await vine.validate({ schema, data });
  return body.data.data.group.mergeRequests.nodes.map(mr => ({
    ...mr,
    url: `${env.host}/${mr.webPath}`,
  }));
}
