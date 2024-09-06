import type fetchDeployedIssues from "#services/fetch_deployed_issues";
import type fetchLabels from "#services/fetch_labels";
import url from "node:url";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const __dirname = url.fileURLToPath(new URL(".", import.meta.url));
const query = loadQuery(__dirname + "add_label_to_issue.graphql");

export default async function addLabelToIssues(args: {
  issues: Awaited<ReturnType<typeof fetchDeployedIssues>>;
  labels: Awaited<ReturnType<typeof fetchLabels>>;
}) {
  const { issues, labels } = args;
  if (issues.length === 0) return;

  const label = labels.find(label => label.title.toLowerCase().includes("deployed"));

  if (!label) return;

  const data = await Promise.allSettled(
    issues.map(issue =>
      executeQuery({
        operationName: "Add_Label_To_Issue",
        query,
        variables: {
          id: issue.iid,
          projectPath: issue.webPath,
          labelId: label.id,
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
