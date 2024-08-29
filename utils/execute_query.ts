import http from "node:http";
import https from "node:https";
import axios from "axios";
import env from "#config/config";

const client = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {
    Authorization: `Bearer ${env.GITLAB_TOKEN}`,
  },
});

export default (body: object) => client.post(env.GITLAB_ENDPOINT, body);
