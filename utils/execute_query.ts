import http from "node:http";
import https from "node:https";
import axios from "axios";
import { env } from "#config/config";

const client = axios.create({
  httpAgent: new http.Agent({ keepAlive: true }),
  httpsAgent: new https.Agent({ keepAlive: true }),
  headers: {
    Authorization: `Bearer ${env.token}`,
  },
});

export default (body: object) => client.post(`${env.host}/api/graphql`, body);
