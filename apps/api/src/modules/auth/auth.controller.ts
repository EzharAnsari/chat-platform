import { FastifyReply, FastifyRequest } from "fastify";
import { AuthService } from "./auth.service";
import { registerSchema, loginSchema } from "./auth.schema";

const service = new AuthService();

export async function registerHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = registerSchema.parse(request.body);
  await service.register(parsed.email, parsed.password);

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

  reply.setCookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false, // true in production
    path: "/"
  });

  return reply.send({ accessToken });
}

export async function refreshHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.cookies.refreshToken;
  if (!token) throw new Error("No refresh token");

  const { accessToken, refreshToken } = await service.refresh(token);

  reply.setCookie("refreshToken", refreshToken, {
    httpOnly: true,
    sameSite: "strict",
    secure: false,
    path: "/"
  });

  return reply.send({ accessToken });
}
