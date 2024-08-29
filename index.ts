import addLabelToIssues from "#services/add_label_to_issues";
import fetchActiveMilestone from "#services/fetch_active_milestone";
import fetchDeployedIssues from "#services/fetch_deployed_issues";
import fetchLabels from "#services/fetch_labels";

function log(text: string) {
  console.log(`[${new Date().toISOString()}] ${text}`);
}

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
