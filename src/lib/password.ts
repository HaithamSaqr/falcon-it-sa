/**
 * Password hashing with Node's built-in scrypt (no external deps).
 * Stored format: `scrypt$<saltHex>$<hashHex>`.
 */

import crypto from "crypto";

const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(plain, salt, KEYLEN).toString("hex");
  return `scrypt$${salt}$${derived}`;
}

export function verifyPasswordHash(plain: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split("$");
    if (scheme !== "scrypt" || !salt || !hash) return false;
    const derived = crypto.scryptSync(plain, salt, KEYLEN);
    const expected = Buffer.from(hash, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function isHashed(value: string | undefined | null): boolean {
  return typeof value === "string" && value.startsWith("scrypt$");
}
