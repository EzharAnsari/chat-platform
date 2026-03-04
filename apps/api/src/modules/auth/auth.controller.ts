import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";
import { prisma } from "@database/client";
import { refreshCookieOptions } from "../../common/constants/cookies";

const service = new AuthService();

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = registerSchema.parse(request.body);
  await service.register(parsed.name, parsed.email, parsed.password);

  return reply.code(201).send({ message: "User created" });
}

export async function loginHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = loginSchema.parse(request.body);

  const { accessToken, refreshToken } = await service.login(
    parsed.email,
    parsed.password,
    request.headers["user-agent"],
    request.ip
  );

  reply.setCookie("refreshToken", refreshToken, refreshCookieOptions);

  return reply.send({ accessToken });
}

export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies.refreshToken;
  if (!token) throw new Error("No refresh token");

  const { accessToken, refreshToken } = await service.refresh(token);

  reply.setCookie("refreshToken", refreshToken, refreshCookieOptions);

  return reply.send({ accessToken });
}

export async function logoutHandler(request: FastifyRequest, reply: FastifyReply) {
  const token = request.cookies.refreshToken;
  if (!token) return reply.send({ message: "Logged out" });

  const hashed = service.hashToken(token);

  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashed },
    data: { revoked: true }
  });

  reply.clearCookie("refreshToken");

  return reply.send({ message: "Logged out" });
}

export async function logoutAllHandler(request: FastifyRequest, reply: FastifyReply) {
  const userId = request.user.userId;

  await prisma.refreshToken.updateMany({
    where: { userId },
    data: { revoked: true }
  });

  reply.clearCookie("refreshToken");

  return reply.send({ message: "Logged out from all devices" });
}
