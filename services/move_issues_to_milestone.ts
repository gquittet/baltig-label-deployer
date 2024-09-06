import type fetchDeployedIssues from "#services/fetch_deployed_issues";
import type fetchLastMilestone from "#services/fetch_last_milestone";
import url from "node:url";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const query = loadQuery(__dirname + "move_issues_to_milestone.graphql");

export default async function moveIssuesToMilestone(args: {
  issues: Awaited<ReturnType<typeof fetchDeployedIssues>>;
  milestone: Awaited<ReturnType<typeof fetchLastMilestone>>;
}) {
  const { issues, milestone } = args;
  if (issues.length === 0) return;

  const data = await Promise.allSettled(
    issues.map(issue =>
      executeQuery({
        operationName: "Move_Issue_To_Milestone",
        query,
        variables: {
          id: issue.iid,
          projectPath: issue.webPath,
          newMilestone: milestone.id,
        },
      }),
    ),
  );

  const errors = data
    .filter(d => d.status === "fulfilled")
    .map(d => d.value.data.errors)
    .filter(error => !!error);
  if (errors.length > 0) {
    for (const error of errors) {
      console.error(error);
    }
  }
}
