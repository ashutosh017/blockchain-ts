import * as crypto from "crypto";

/**
 * Computes the SHA-256 hash of a given input string.
 * @param data The string to be hashed.
 * @returns The SHA-256 hash as a hex string.
 */
export function sha256(data: string) {
  return crypto.createHash("sha256").update(data).digest("hex");
}
