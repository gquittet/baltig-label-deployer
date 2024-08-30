import env from "#config/config";
import addLabelToIssues from "#services/add_label_to_issues";
import fetchActiveMilestone from "#services/fetch_active_milestone";
import fetchAllOpenedIssuesOfMilestone from "#services/fetch_all_opened_issues_of_milestone";
import fetchDeployedIssues from "#services/fetch_deployed_issues";
import fetchLabels from "#services/fetch_labels";
import fetchLastMilestone from "#services/fetch_last_milestone";
import fetchMrOfMilestone from "#services/fetch_mr_of_milestone";
import moveIssuesToMilestone from "#services/move_issues_to_milestone";

function log(...args: unknown[]) {
  console.log(`[${new Date().toISOString()}]`, ...args);
}

async function newMilestone() {
  log(`Fetching last milestone 🚧`);
  const newMilestone = await fetchLastMilestone();
  log("Fetched last milestone successfully ✔");
  log("Fetching active milestone 🚧");
  const activeMilestone = await fetchActiveMilestone();
  log("Fetched active milestone successfully ✔");
  if (newMilestone.id === activeMilestone.id) {
    log(
      `You have to create a new milestone first: ${env.GITLAB_ENDPOINT}/groups/${env.PROJECT_PATH}/-/milestones/new`,
    );
    return;
  }

  log("Fetching issues 🚚");
  const issues = await fetchAllOpenedIssuesOfMilestone({ milestone: activeMilestone });
  log("Fetched issues successfully ✔");
  log(`Updating ${issues.length} issues 🏗️`);
  await moveIssuesToMilestone({ issues, milestone: newMilestone });
  const mergeRequests = await fetchMrOfMilestone({ milestone: activeMilestone });
  log("Done! 📦");
  if (mergeRequests.length) {
    log(
      "You have to manually update these merge requests:\n",
      "- " + mergeRequests.map(mr => mr.url).join("\n- "),
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
  log("Fetching issues 🚚");
  const issues = await fetchDeployedIssues({ labels, milestone });
  log("Fetched issues successfully ✔");
  log(`Updating ${issues.length} issues 🏗️`);
  await addLabelToIssues({ issues, labels });
  log("Done! 📦");
}

export default async (flags: Record<string, unknown>) => {
  if (flags.deploy) {
    await addDeployLabels();
  } else if (flags.milestone) {
    await newMilestone();
  }
};
