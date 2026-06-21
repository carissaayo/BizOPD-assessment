import { createServer } from "http";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const server = createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server is listening on port ${env.PORT}`);
});
