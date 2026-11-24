import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import { DatabaseSync } from "node:sqlite";

/* SQLite با ماژول داخلی Node — بدون وابستگی بومی.
   برای نمونهٔ اجرایی این سرویس کافی است؛ در استقرار واقعی با
   Postgres/Redis جایگزین می‌شود (جزئیات در docs/auth.md). */

export function openDatabase(path) {
  if (path !== ":memory:") mkdirSync(dirname(path), { recursive: true });

  const db = new DatabaseSync(path);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            TEXT PRIMARY KEY,
      phone         TEXT NOT NULL UNIQUE,
      name          TEXT,
      level         TEXT,
      goal          TEXT,
      password_hash TEXT NOT NULL,
      verified_at   TEXT,
      onboarded_at  TEXT,
      created_at    TEXT NOT NULL,
      updated_at    TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS challenges (
      id            TEXT PRIMARY KEY,
      purpose       TEXT NOT NULL,
      phone         TEXT NOT NULL,
      user_id       TEXT,
      code_hash     TEXT NOT NULL,
      expires_at    INTEGER NOT NULL,
      attempts      INTEGER NOT NULL DEFAULT 0,
      resend_count  INTEGER NOT NULL DEFAULT 0,
      last_sent_at  INTEGER NOT NULL,
      consumed_at   INTEGER,
      created_at    INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id           TEXT PRIMARY KEY,
      token_hash   TEXT NOT NULL UNIQUE,
      user_id      TEXT NOT NULL,
      created_at   INTEGER NOT NULL,
      expires_at   INTEGER NOT NULL,
      last_seen_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS login_attempts (
      id        INTEGER PRIMARY KEY AUTOINCREMENT,
      phone     TEXT NOT NULL,
      ip        TEXT,
      failed_at INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_challenges_phone ON challenges(phone, purpose);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_login_attempts_phone ON login_attempts(phone, failed_at);
  `);

  return db;
}

export function findUserByPhone(db, phone) {
  return db.prepare("SELECT * FROM users WHERE phone = ?").get(phone) ?? null;
}

export function findUserById(db, id) {
  return db.prepare("SELECT * FROM users WHERE id = ?").get(id) ?? null;
}

export function insertUser(db, user) {
  db.prepare(
    `INSERT INTO users
       (id, phone, name, level, goal, password_hash, verified_at, onboarded_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    user.id,
    user.phone,
    user.name ?? null,
    user.level ?? null,
    user.goal ?? null,
    user.passwordHash,
    user.verifiedAt ?? null,
    user.onboardedAt ?? null,
    user.createdAt,
    user.updatedAt,
  );
}

export function updateUser(db, id, patch) {
  const current = findUserById(db, id);
  if (!current) return null;

  const next = { ...current, ...patch, updated_at: new Date().toISOString() };
  db.prepare(
    `UPDATE users
        SET name = ?, level = ?, goal = ?, password_hash = ?,
            verified_at = ?, onboarded_at = ?, updated_at = ?
      WHERE id = ?`,
  ).run(
    next.name,
    next.level,
    next.goal,
    next.password_hash,
    next.verified_at,
    next.onboarded_at,
    next.updated_at,
    id,
  );

  return findUserById(db, id);
}

export function insertChallenge(db, challenge) {
  db.prepare(
    `INSERT INTO challenges
       (id, purpose, phone, user_id, code_hash, expires_at, attempts, resend_count, last_sent_at, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?, ?)`,
  ).run(
    challenge.id,
    challenge.purpose,
    challenge.phone,
    challenge.userId ?? null,
    challenge.codeHash,
    challenge.expiresAt,
    challenge.resendCount ?? 0,
    challenge.lastSentAt,
    challenge.createdAt,
  );
}

export function findChallenge(db, id) {
  return db.prepare("SELECT * FROM challenges WHERE id = ?").get(id) ?? null;
}

export function deleteChallenge(db, id) {
  db.prepare("DELETE FROM challenges WHERE id = ?").run(id);
}

export function consumeChallenges(db, phone, purpose, now = Date.now()) {
  db.prepare(
    `UPDATE challenges SET consumed_at = ?
      WHERE phone = ? AND purpose = ? AND consumed_at IS NULL`,
  ).run(now, phone, purpose);
}

export function latestChallenge(db, phone, purpose) {
  return (
    db
      .prepare(
        `SELECT * FROM challenges
          WHERE phone = ? AND purpose = ? AND consumed_at IS NULL
          ORDER BY created_at DESC LIMIT 1`,
      )
      .get(phone, purpose) ?? null
  );
}

export function bumpChallenge(db, id, patch) {
  const current = findChallenge(db, id);
  if (!current) return null;

  const next = { ...current, ...patch };
  db.prepare(
    `UPDATE challenges
        SET code_hash = ?, expires_at = ?, attempts = ?, resend_count = ?,
            last_sent_at = ?, consumed_at = ?
      WHERE id = ?`,
  ).run(
    next.code_hash,
    next.expires_at,
    next.attempts,
    next.resend_count,
    next.last_sent_at,
    next.consumed_at,
    id,
  );

  return findChallenge(db, id);
}

export function insertSession(db, session) {
  db.prepare(
    `INSERT INTO sessions (id, token_hash, user_id, created_at, expires_at, last_seen_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
  ).run(
    session.id,
    session.tokenHash,
    session.userId,
    session.createdAt,
    session.expiresAt,
    session.createdAt,
  );
}

export function findSession(db, tokenHash) {
  return (
    db.prepare("SELECT * FROM sessions WHERE token_hash = ?").get(tokenHash) ??
    null
  );
}

export function touchSession(db, id, now = Date.now()) {
  db.prepare("UPDATE sessions SET last_seen_at = ? WHERE id = ?").run(now, id);
}

export function deleteSession(db, tokenHash) {
  db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(tokenHash);
}

export function deleteUserSessions(db, userId) {
  db.prepare("DELETE FROM sessions WHERE user_id = ?").run(userId);
}

export function recordFailedLogin(db, phone, ip, now = Date.now()) {
  db.prepare(
    "INSERT INTO login_attempts (phone, ip, failed_at) VALUES (?, ?, ?)",
  ).run(phone, ip ?? null, now);
}

export function recentFailures(db, phone, since) {
  const row = db
    .prepare(
      "SELECT COUNT(*) AS count FROM login_attempts WHERE phone = ? AND failed_at >= ?",
    )
    .get(phone, since);
  return Number(row?.count ?? 0);
}

export function clearFailures(db, phone) {
  db.prepare("DELETE FROM login_attempts WHERE phone = ?").run(phone);
}

export function purgeExpired(db, now = Date.now()) {
  db.prepare("DELETE FROM sessions WHERE expires_at < ?").run(now);
  db.prepare("DELETE FROM challenges WHERE created_at < ?").run(
    now - 24 * 60 * 60 * 1000,
  );
  db.prepare("DELETE FROM login_attempts WHERE failed_at < ?").run(
    now - 24 * 60 * 60 * 1000,
  );
}
