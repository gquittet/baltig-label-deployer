import vine from "@vinejs/vine";
import env from "#config/config";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const query = loadQuery("./services/fetch_labels.graphql");

const schema = vine.object({
  data: vine.object({
    data: vine.object({
      group: vine.object({
        labels: vine.object({
          nodes: vine.array(
            vine.object({
              id: vine.string(),
              title: vine.string(),
            }),
          ),
        }),
      }),
    }),
  }),
});

export default async function fetchLabels() {
  const data = await executeQuery({
    operationName: "Find_All_BlueHorn_Labels",
    query,
    variables: { prefix: "0 - ", projectPath: env.PROJECT_PATH },
  });
  const body = await vine.validate({ schema, data });
  return body.data.data.group.labels.nodes;
}
