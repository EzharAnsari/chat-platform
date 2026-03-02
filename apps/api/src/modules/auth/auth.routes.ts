import { FastifyInstance } from "fastify";
import {
  registerHandler,
  loginHandler,
  refreshHandler
} from "./auth.controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/auth/register", registerHandler);
  app.post("/auth/login", loginHandler);
  app.post("/auth/refresh", refreshHandler);
}