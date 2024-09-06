import type fetchActiveMilestone from "#services/fetch_active_milestone";
import type fetchLabels from "#services/fetch_labels";
import url from "node:url";
import vine from "@vinejs/vine";
import { env } from "#config/config";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const query = loadQuery(__dirname + "fetch_deployed_issues.graphql");

const schema = vine.object({
  data: vine.object({
    data: vine.object({
      group: vine.object({
        issues: vine.object({
          nodes: vine.array(
            vine.object({
              iid: vine.string().regex(/^\d+$/),
              webPath: vine
                .string()
                .startsWith(`/${env.project}/`)
                .regex(/\/-\/issues\/\d+/)
                .transform(value => value.split("/-/")[0].slice(1)),
            }),
          ),
        }),
      }),
    }),
  }),
});

export default async function fetchDeployedIssues(args: {
  labels: Awaited<ReturnType<typeof fetchLabels>>;
  milestone: Awaited<ReturnType<typeof fetchActiveMilestone>>;
}) {
  const data = await executeQuery({
    operationName: "Find_All_Issues_To_Add_Deployed",
    query,
    variables: {
      projectPath: env.project,
      milestone: args.milestone.title,
      labels: args.labels.map(label => label.title),
    },
  });

  const body = await vine.validate({ schema, data });
  return body.data.data.group.issues.nodes;
}
