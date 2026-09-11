import { randomBytes, scryptSync, timingSafeEqual as cryptoTimingSafeEqual } from "crypto";
import { jwtVerify, SignJWT } from "jose";

export const HOST_SESSION_COOKIE = "host_session";
const SESSION_TTL = "7d";
const SCRYPT_KEYLEN = 64;

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET env var is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createHostSessionToken(username: string): Promise<string> {
  return new SignJWT({ role: "host", username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(getSecretKey());
}

export async function verifyHostSessionToken(
  token: string | undefined,
): Promise<{ username: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "host" || typeof payload.username !== "string") return null;
    return { username: payload.username };
  } catch {
    return null;
  }
}

export function timingSafeEqual(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  const maxLen = Math.max(aBytes.length, bBytes.length);
  let diff = aBytes.length === bBytes.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    diff |= (aBytes[i] ?? 0) ^ (bBytes[i] ?? 0);
  }
  return diff === 0;
}

export function hashPassword(password: string): { hash: string; salt: string } {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, SCRYPT_KEYLEN).toString("hex");
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const candidate = scryptSync(password, salt, SCRYPT_KEYLEN);
  const stored = Buffer.from(hash, "hex");
  if (candidate.length !== stored.length) return false;
  return cryptoTimingSafeEqual(candidate, stored);
}
