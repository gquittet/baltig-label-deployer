import vine from "@vinejs/vine";
import executeQuery from "#utils/execute_query";
import loadQuery from "#utils/load_query";

const query = loadQuery("./services/fetch_active_milestone.graphql");

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
      projectPath: "product/bluehorn",
    },
  });
  const body = await vine.validate({ schema, data });
  return body.data.data.group.milestones.nodes[0];
}
