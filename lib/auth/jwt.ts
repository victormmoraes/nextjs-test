import jwt from "jsonwebtoken";

export interface JWTPayload {
  userId: number;
  tenantId: number;
  email: string;
  roles: string[];
}

interface TokenPayload extends JWTPayload {
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

export function signToken(payload: JWTPayload): string {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

export function generateRefreshToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function getRefreshTokenExpiry(): Date {
  const expiresIn = process.env.REFRESH_TOKEN_EXPIRES_IN || "7d";
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days
  }

  const value = parseInt(match[1]);
  const unit = match[2];

  let ms: number;
  switch (unit) {
    case "d":
      ms = value * 24 * 60 * 60 * 1000;
      break;
    case "h":
      ms = value * 60 * 60 * 1000;
      break;
    case "m":
      ms = value * 60 * 1000;
      break;
    case "s":
      ms = value * 1000;
      break;
    default:
      ms = 7 * 24 * 60 * 60 * 1000;
  }

  return new Date(Date.now() + ms);
}
