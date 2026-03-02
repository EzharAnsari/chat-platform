/// <reference path="./global.d.ts" />
import { buildApp } from "./app";
import { env } from "@config/env";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
    console.log(`Server running on port ${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();