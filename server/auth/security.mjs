import {
  createHmac,
  randomBytes,
  randomInt,
  randomUUID,
  scrypt,
  timingSafeEqual,
} from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

const SCRYPT = { N: 16384, r: 8, p: 1, keylen: 64 };

/** رمز عبور فقط به شکل scrypt با نمک تصادفی ذخیره می‌شود. */
export async function hashPassword(password) {
  const salt = randomBytes(16);
  const derived = await scryptAsync(password, salt, SCRYPT.keylen, {
    N: SCRYPT.N,
    r: SCRYPT.r,
    p: SCRYPT.p,
  });

  return [
    "scrypt",
    SCRYPT.N,
    SCRYPT.r,
    SCRYPT.p,
    salt.toString("base64"),
    derived.toString("base64"),
  ].join("$");
}

export async function verifyPassword(password, stored) {
  try {
    const [scheme, N, r, p, saltB64, hashB64] = String(stored).split("$");
    if (scheme !== "scrypt") return false;

    const salt = Buffer.from(saltB64, "base64");
    const expected = Buffer.from(hashB64, "base64");
    const derived = await scryptAsync(password, salt, expected.length, {
      N: Number(N),
      r: Number(r),
      p: Number(p),
    });

    return (
      derived.length === expected.length && timingSafeEqual(derived, expected)
    );
  } catch {
    return false;
  }
}

export function newId() {
  return randomUUID();
}

export function newToken() {
  return randomBytes(32).toString("base64url");
}

/** فقط هش نشست ذخیره می‌شود؛ اگر دیتابیس لو برود توکن‌ها قابل استفاده نیستند. */
export function hashToken(token, secret) {
  return createHmac("sha256", secret).update(token).digest("hex");
}

export function hashCode(challengeId, code, secret) {
  return createHmac("sha256", secret)
    .update(`${challengeId}:${code}`)
    .digest("hex");
}

export function safeEqualHex(a, b) {
  const left = Buffer.from(String(a), "hex");
  const right = Buffer.from(String(b), "hex");
  return left.length === right.length && timingSafeEqual(left, right);
}

export function generateCode(length = 6) {
  const max = 10 ** length;
  return String(randomInt(0, max)).padStart(length, "0");
}

/** همان قوانینی که کلاینت نشان می‌دهد؛ سرور مرجع نهایی است. */
export function passwordIssues(password, phone = "") {
  const issues = [];
  if (password.length < 8) issues.push("short");
  if (password.length > 72) issues.push("long");
  if (!/\p{L}/u.test(password)) issues.push("no-letter");
  if (!/[0-9]/.test(password)) issues.push("no-digit");

  const phoneDigits = phone.replace(/\D/g, "").replace(/^0+/, "");
  const passwordDigits = password.replace(/\D/g, "").replace(/^0+/, "");
  if (
    phoneDigits.length >= 7 &&
    passwordDigits.length >= 7 &&
    (phoneDigits.endsWith(passwordDigits) ||
      passwordDigits.endsWith(phoneDigits))
  ) {
    issues.push("same-as-phone");
  }

  return issues;
}

export function cleanName(name) {
  return typeof name === "string" ? name.trim().replace(/\s+/g, " ") : "";
}

export function nameIssue(name) {
  if (!name) return "empty";
  if (name.length < 2) return "short";
  if (name.length > 24) return "long";
  if (!/^[\p{L}\s'.-]+$/u.test(name)) return "chars";
  return null;
}
