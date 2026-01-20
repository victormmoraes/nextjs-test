import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import {
  signToken,
  generateRefreshToken,
  getRefreshTokenExpiry,
  type JWTPayload,
} from "@/lib/auth/jwt";
import { UnauthorizedError, NotFoundError } from "@/lib/utils/errors";
import type { LoginResponse, TokenPair } from "@/types/auth";

export const authService = {
  async login(
    email: string,
    password: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<LoginResponse> {
    const user = await prisma.user.findUnique({
      where: { email, enabled: true },
      include: {
        tenant: true,
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid credentials");
    }

    const roles = user.roles.map((ur) => ur.role.name);

    const payload: JWTPayload = {
      userId: user.id,
      tenantId: user.tenantId,
      email: user.email,
      roles,
    };

    const accessToken = signToken(payload);
    const refreshToken = generateRefreshToken();

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiry: getRefreshTokenExpiry(),
      },
    });

    // Update last logged in time (Brazil timezone)
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoggedInAt: new Date() },
    });

    // Log access
    await prisma.userAccessLog.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        ipAddress,
        userAgent,
        loggedInAt: new Date(),
        createdBy: user.email,
        updatedBy: user.email,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        tenantId: user.tenantId,
        tenantName: user.tenant.name,
        roles,
      },
    };
  },

  async refresh(refreshToken: string): Promise<TokenPair> {
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
          include: {
            roles: {
              include: { role: true },
            },
          },
        },
      },
    });

    if (!storedToken) {
      throw new UnauthorizedError("Invalid refresh token");
    }

    if (storedToken.expiry < new Date()) {
      await prisma.refreshToken.delete({ where: { id: storedToken.id } });
      throw new UnauthorizedError("Refresh token expired");
    }

    if (!storedToken.user.enabled) {
      throw new UnauthorizedError("User account is disabled");
    }

    const roles = storedToken.user.roles.map((ur) => ur.role.name);

    const payload: JWTPayload = {
      userId: storedToken.user.id,
      tenantId: storedToken.user.tenantId,
      email: storedToken.user.email,
      roles,
    };

    const newAccessToken = signToken(payload);
    const newRefreshToken = generateRefreshToken();

    // Rotate refresh token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: newRefreshToken,
        expiry: getRefreshTokenExpiry(),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(refreshToken: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  },

  async logoutAll(userId: number): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  },

  async getMe(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId, enabled: true },
      include: {
        tenant: true,
        roles: {
          include: { role: true },
        },
      },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      tenantId: user.tenantId,
      tenant: {
        id: user.tenant.id,
        name: user.tenant.name,
        tenantLogo: user.tenant.tenantLogo,
      },
      roles: user.roles.map((ur) => ur.role.name),
      lastLoggedInAt: user.lastLoggedInAt,
      createdAt: user.createdAt,
    };
  },

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError("User", userId);
    }

    const isValidPassword = await verifyPassword(currentPassword, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedError("Current password is incorrect");
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        updatedBy: user.email,
      },
    });

    // Invalidate all refresh tokens on password change
    await this.logoutAll(userId);
  },
};
