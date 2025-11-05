import { env } from "#config/config";
import addLabelToIssues from "#services/add_label_to_issues";
import fetchActiveMilestone from "#services/fetch_active_milestone";
import fetchAllOpenedIssuesOfMilestone from "#services/fetch_all_opened_issues_of_milestone";
import fetchDeployedIssues from "#services/fetch_deployed_issues";
import fetchLabels from "#services/fetch_labels";
import fetchLastMilestone from "#services/fetch_last_milestone";
import fetchMrOfMilestone from "#services/fetch_mr_of_milestone";
import moveIssuesToMilestone from "#services/move_issues_to_milestone";

const PAGINATION_SIZE = 100;

function log(...args: unknown[]) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

const plural = (n: number, text: string): string => {
  if (text === "this") return n > 1 ? "these" : "this";
  if (n <= 1 || text.endsWith("s")) return `${n} ${text}`;
  return `${n} ${text}s`;
};

async function newMilestone() {
  log(`Fetching last milestone 🚧`);
  const newMilestone = await fetchLastMilestone();
  log("Fetched last milestone successfully ✔");
  log("Fetching active milestone 🚧");
  const activeMilestone = await fetchActiveMilestone();
  log("Fetched active milestone successfully ✔");
  if (newMilestone.id === activeMilestone.id) {
    log(
      `You have to create a new milestone first: ${env.host}/groups/${env.project}/-/milestones/new`,
    );
    return;
  }

  // Fetch the issues 1 time and handle pagination
  let shouldFetchIssues = true;
  let totalIssuesMoved = 0;
  while (shouldFetchIssues) {
    log("Fetching issues 🚚");
    const issues = await fetchAllOpenedIssuesOfMilestone({ milestone: activeMilestone });
    log("Fetched issues successfully ✔");
    if (issues.length === 0) {
      break;
    }
    log(`Moving ${plural(issues.length, "issue")} to the new milestone 🏗️`);
    await moveIssuesToMilestone({ issues, milestone: newMilestone });
    totalIssuesMoved += issues.length;
    shouldFetchIssues = issues.length === PAGINATION_SIZE;
  }
  if (totalIssuesMoved === 0) {
    log("No issue was moved ✔")
  } else {
    log(`Moved ${plural(totalIssuesMoved, "issue")} ✔`);
  }

  log("Fetching merge requests 🚚");
  const mergeRequests = await fetchMrOfMilestone({ milestone: activeMilestone });
  log("Done! 📦");
  if (mergeRequests.length) {
    log(
      `You have to manually update ${plural(mergeRequests.length, "this")} ${plural(mergeRequests.length, "merge request")}:\n-`,
      mergeRequests.map(mr => mr.url).join("\n- "),
    );
  }
}

async function addDeployLabels() {
  log(`Fetching labels 🏷`);
  const labels = await fetchLabels();
  log("Fetched labels successfully ✔");
  log("Fetching active milestone 🚚");
  const milestone = await fetchActiveMilestone();
  log("Fetched active milestone successfully ✔");

  let shouldFetchIssues = true;
  let totalIssuesUpdated = 0;
  while (shouldFetchIssues) {
    log("Fetching issues 🚚");
    const issues = await fetchDeployedIssues({ labels, milestone });
    log("Fetched issues successfully ✔");
    if (issues.length === 0) {
      break;
    }
    log(`Updating ${plural(issues.length, "issue")} 🏗️`);
    await addLabelToIssues({ issues, labels });
    totalIssuesUpdated += issues.length;
    shouldFetchIssues = issues.length === PAGINATION_SIZE;
  }
  if (totalIssuesUpdated === 0) {
    log(`No issue was updated ✔`);
  } else {
    log(`Successfully added deploy label on ${plural(totalIssuesUpdated, "issue")} ✔`);
  }
  log("Done! 📦");
}

export default async (flags: Record<string, unknown>) => {
  if (flags.deploy) {
    await addDeployLabels();
  } else if (flags.milestone) {
    await newMilestone();
  }
};
