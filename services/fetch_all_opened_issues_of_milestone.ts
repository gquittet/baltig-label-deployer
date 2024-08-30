import type fetchActiveMilestone from "#services/fetch_active_milestone";
import vine from "@vinejs/vine";
import { env } from "#config/config";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const query = loadQuery("./services/fetch_all_opened_issues_of_milestone.graphql");

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

export default async function fetchAllOpenedIssuesOfMilestone(args: {
  milestone: Awaited<ReturnType<typeof fetchActiveMilestone>>;
}) {
  const data = await executeQuery({
    operationName: "Fetch_All_Opened_Issues_Of_Milestone",
    query,
    variables: {
      projectPath: env.project,
      milestone: args.milestone.title,
    },
  });

  const body = await vine.validate({ schema, data });
  return body.data.data.group.issues.nodes;
}
