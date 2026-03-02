import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { prisma } from "@database/client";
import { env } from "@config/env";
import { AppError } from "../../common/errors/app-error";

const SALT_ROUNDS = 12;

export class AuthService {

  async register(email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError("User exists", 409);

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: { email, passwordHash }
    });

    return user;
  }

  async login(email: string, password: string, userAgent?: string, ip?: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new AppError("Invalid credentials", 401);

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError("Invalid credentials", 401);

    const accessToken = this.generateAccessToken(user.id);
    const refreshToken = this.generateRefreshToken(user.id);

    await prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(refreshToken),
        userId: user.id,
        userAgent,
        ipAddress: ip
      }
    });

    return { accessToken, refreshToken };
  }

  async refresh(oldRefreshToken: string) {
    const payload = jwt.verify(
      oldRefreshToken,
      env.JWT_REFRESH_SECRET
    ) as { userId: string };

    const hashed = this.hashToken(oldRefreshToken);

    const stored = await prisma.refreshToken.findFirst({
      where: {
        tokenHash: hashed,
        revoked: false
      }
    });

    if (!stored) throw new AppError("Invalid refresh token", 401);

    // rotate
    await prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revoked: true }
    });

    const newRefreshToken = this.generateRefreshToken(payload.userId);
    const newAccessToken = this.generateAccessToken(payload.userId);

    await prisma.refreshToken.create({
      data: {
        tokenHash: this.hashToken(newRefreshToken),
        userId: payload.userId
      }
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  private generateAccessToken(userId: string) {
    return jwt.sign(
      { userId },
      env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" }
    );
  }

  private generateRefreshToken(userId: string) {
    return jwt.sign(
      { userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );
  }

  private hashToken(token: string) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }
}