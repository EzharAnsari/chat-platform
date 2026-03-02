import Fastify from "fastify";
import cors from "@fastify/cors";
import cookie from "@fastify/cookie";
import jwt from "@fastify/jwt";
import { env } from "@config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { AppError } from "./common/errors/app-error";
import { authPlugin } from "./plugins/auth";
import { setupSocketServer } from "./realtime/socket.server";

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

  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        success: false,
        message: error.message
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      success: false,
      message: "Internal Server Error"
    });
  });

  await app.register(authPlugin);

  app.get("/health", async () => {
    return { status: "ok" };
  });

  const io = setupSocketServer(app);

  return app;
}