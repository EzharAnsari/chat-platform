import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { env } from "@config/env";
import { authRoutes } from "./modules/auth/auth.routes";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true,
    credentials: true
  });

  await app.register(cookie);

  await app.register(jwt, {
    secret: env.JWT_ACCESS_SECRET,
    sign: { expiresIn: "15m" }
  });

  await app.register(authRoutes);

  app.get("/health", async () => {
    return { status: "ok" };
  });

  return app;
}