import {
  bumpChallenge,
  clearFailures,
  consumeChallenges,
  deleteChallenge,
  deleteSession,
  deleteUserSessions,
  findChallenge,
  findSession,
  findUserById,
  findUserByPhone,
  insertChallenge,
  insertSession,
  insertUser,
  latestChallenge,
  purgeExpired,
  recentFailures,
  recordFailedLogin,
  touchSession,
  updateUser,
} from "./db.mjs";
import { errors } from "./errors.mjs";
import { normalizePhone } from "./phone.mjs";
import {
  cleanName,
  generateCode,
  hashCode,
  hashPassword,
  hashToken,
  nameIssue,
  newId,
  newToken,
  passwordIssues,
  safeEqualHex,
  verifyPassword,
} from "./security.mjs";

const LEVELS = new Set(["A1", "A2", "B1", "B2", "C1", "C2"]);
const GOALS = new Set([
  "travel",
  "work",
  "daily",
  "study",
  "immigration",
  "exam",
  "media",
  "family",
]);
const AVATARS = new Set(["leo", "sun", "sky", "mint", "rose", "violet"]);
const DAILY_MINUTES = new Set([5, 10, 15, 30]);
const BIO_MAX = 60;
const LOCK_WINDOW_MS = 15 * 60 * 1000;
const MAX_FAILED_LOGINS = 6;
const MAX_RESENDS_PER_CHALLENGE = 5;
const CHALLENGE_WINDOW_MS = 60 * 60 * 1000;

/* «هش ساختگی» تا ورود با شمارهٔ ناموجود هم زمان مشابهی بگیرد و
   شمارش حساب‌ها از راه زمان پاسخ ساده نشود. */
const DUMMY_HASH = await hashPassword("leo-learn-timing-guard");

function publicUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    phone: row.phone,
    name: row.name,
    level: row.level,
    goal: row.goal,
    avatar: row.avatar ?? null,
    bio: row.bio ?? null,
    dailyMinutes: row.daily_minutes ?? null,
    createdAt: row.created_at,
    onboardedAt: row.onboarded_at ?? null,
  };
}

function publicChallenge(config, row) {
  return {
    challengeId: row.id,
    purpose: row.purpose,
    phone: row.phone,
    expiresAt: new Date(row.expires_at).toISOString(),
    resendAfterSeconds: config.otp.resendCooldownSeconds,
    codeLength: config.otp.length,
  };
}

function requireString(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw errors.badRequest(`${field}_required`);
  }
  return value;
}

export function createAuthService({ db, config, sms, now = () => Date.now(), logger = console }) {
  const otp = config.otp;

  function createSession(userId) {
    const token = newToken();
    const tokenHash = hashToken(token, config.sessionSecret);
    const createdAt = now();
    const expiresAt = createdAt + config.session.ttlDays * 24 * 60 * 60 * 1000;

    insertSession(db, {
      id: newId(),
      tokenHash,
      userId,
      createdAt,
      expiresAt,
    });

    return { token, expiresAt };
  }

  function challengeCooldown(phone, purpose) {
    const previous = latestChallenge(db, phone, purpose);
    if (!previous) return null;

    const elapsed = now() - previous.last_sent_at;
    const wait = otp.resendCooldownSeconds * 1000 - elapsed;
    if (wait > 0) {
      throw errors.rateLimited(Math.ceil(wait / 1000));
    }

    const age = now() - previous.created_at;
    const inHour = Number(previous.resend_count ?? 0);
    if (inHour >= MAX_RESENDS_PER_CHALLENGE && age < CHALLENGE_WINDOW_MS) {
      throw errors.rateLimited(Math.ceil((CHALLENGE_WINDOW_MS - age) / 1000));
    }

    /* چالش کهنه نباید سقف ارسال را برای همیشه قفل کند؛ اجرای تازه می‌گیرد. */
    return age < CHALLENGE_WINDOW_MS ? previous : null;
  }

  function issueChallenge({ purpose, phone, userId, previous }) {
    const code = generateCode(otp.length);
    const at = now();
    const expiresAt = at + otp.ttlSeconds * 1000;

    /* شناسه از قبل لازم است چون هش کد به شناسه گره خورده است. */
    const id = previous?.id ?? newId();
    const codeHash = hashCode(id, code, config.sessionSecret);

    if (previous) {
      bumpChallenge(db, id, {
        code_hash: codeHash,
        expires_at: expiresAt,
        attempts: 0,
        resend_count: Number(previous.resend_count ?? 0) + 1,
        last_sent_at: at,
        consumed_at: null,
      });
    } else {
      insertChallenge(db, {
        id,
        purpose,
        phone,
        userId,
        codeHash,
        expiresAt,
        resendCount: 0,
        lastSentAt: at,
        createdAt: at,
      });
    }

    return { id, code };
  }

  async function deliver(phone, code) {
    try {
      await sms({ phone, code });
    } catch (error) {
      logger.error("[auth] sms delivery failed", error?.message ?? error);
      throw errors.smsFailed();
    }
  }

  return {
    async signUpStart(body) {
      const rawName = cleanName(body?.name);
      const nameProblem = nameIssue(rawName);
      if (nameProblem) {
        throw errors.badRequest(`name_${nameProblem}`);
      }

      const phone = normalizePhone(requireString(body?.phone, "phone"));
      if (!phone) throw errors.phoneInvalid();

      const password = requireString(body?.password, "password");
      const issues = passwordIssues(password, phone);
      if (issues.length > 0) {
        throw errors.passwordInvalid(issues.join(","));
      }

      const existing = findUserByPhone(db, phone);
      if (existing?.verified_at) throw errors.phoneTaken();

      const previous = challengeCooldown(phone, "signup");

      const passwordHash = await hashPassword(password);
      const at = new Date(now()).toISOString();

      let userId = existing?.id;
      if (existing) {
        updateUser(db, existing.id, {
          name: rawName,
          password_hash: passwordHash,
          updated_at: at,
        });
      } else {
        userId = newId();
        insertUser(db, {
          id: userId,
          phone,
          name: rawName,
          passwordHash,
          createdAt: at,
          updatedAt: at,
        });
      }

      const challenge = issueChallenge({
        purpose: "signup",
        phone,
        userId,
        previous,
      });

      try {
        await deliver(phone, challenge.code);
      } catch (error) {
        /* اگر پیامک نرفت، کد قبلی باید همان‌طور معتبر بماند. */
        if (previous) {
          bumpChallenge(db, previous.id, {
            code_hash: previous.code_hash,
            expires_at: previous.expires_at,
            attempts: previous.attempts,
            resend_count: previous.resend_count,
            last_sent_at: previous.last_sent_at,
          });
        } else {
          deleteChallenge(db, challenge.id);
        }
        throw error;
      }

      return publicChallenge(config, findChallenge(db, challenge.id));
    },

    async signUpVerify(body) {
      const challengeId = requireString(body?.challengeId, "challengeId");
      const code = requireString(body?.code, "code");

      const challenge = findChallenge(db, challengeId);
      if (!challenge || challenge.purpose !== "signup" || challenge.consumed_at) {
        throw errors.challengeNotFound();
      }
      if (now() > challenge.expires_at) throw errors.codeExpired();
      if (challenge.attempts >= otp.maxAttempts) throw errors.tooManyAttempts();

      const expected = hashCode(challenge.id, code, config.sessionSecret);
      if (!safeEqualHex(expected, challenge.code_hash)) {
        const attempts = challenge.attempts + 1;
        bumpChallenge(db, challenge.id, { attempts });
        if (attempts >= otp.maxAttempts) throw errors.tooManyAttempts();
        throw errors.codeInvalid(otp.maxAttempts - attempts);
      }

      bumpChallenge(db, challenge.id, { consumed_at: now() });
      consumeChallenges(db, challenge.phone, "signup", now());

      const at = new Date(now()).toISOString();
      const user = updateUser(db, challenge.user_id, {
        verified_at: findUserById(db, challenge.user_id)?.verified_at ?? at,
      });

      if (!user) throw errors.challengeNotFound();

      return { user: publicUser(user), session: createSession(user.id) };
    },

    async signIn(body) {
      const phone = normalizePhone(requireString(body?.phone, "phone"));
      if (!phone) throw errors.phoneInvalid();
      const password = requireString(body?.password, "password");

      const since = now() - LOCK_WINDOW_MS;
      const failures = recentFailures(db, phone, since);
      if (failures >= MAX_FAILED_LOGINS) {
        /* حداقل پنجرهٔ قفل؛ با گذشت زمان و پیرشدن تلاش‌های قدیمی آزاد می‌شود. */
        throw errors.accountLocked(Math.ceil(LOCK_WINDOW_MS / 1000));
      }

      const user = findUserByPhone(db, phone);
      const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);

      if (!user || !user.verified_at || !ok) {
        recordFailedLogin(db, phone);
        throw errors.invalidCredentials();
      }

      clearFailures(db, phone);
      return { user: publicUser(user), session: createSession(user.id) };
    },

    async session(token) {
      if (!token) return null;

      const tokenHash = hashToken(token, config.sessionSecret);
      const row = findSession(db, tokenHash);
      if (!row) return null;

      if (now() > row.expires_at) {
        deleteSession(db, tokenHash);
        return null;
      }

      touchSession(db, row.id, now());
      const user = findUserById(db, row.user_id);
      if (!user || !user.verified_at) {
        deleteSession(db, tokenHash);
        return null;
      }

      return { user: publicUser(user), session: { expiresAt: row.expires_at } };
    },

    async signOut(token) {
      if (!token) return;
      deleteSession(db, hashToken(token, config.sessionSecret));
    },

    async resend(body) {
      const challengeId = requireString(body?.challengeId, "challengeId");
      const challenge = findChallenge(db, challengeId);

      if (!challenge || challenge.consumed_at) throw errors.challengeNotFound();

      const wait =
        otp.resendCooldownSeconds * 1000 - (now() - challenge.last_sent_at);
      if (wait > 0) throw errors.rateLimited(Math.ceil(wait / 1000));
      const age = now() - challenge.created_at;
      if (
        Number(challenge.resend_count ?? 0) >= MAX_RESENDS_PER_CHALLENGE &&
        age < CHALLENGE_WINDOW_MS
      ) {
        throw errors.rateLimited(
          Math.ceil((CHALLENGE_WINDOW_MS - age) / 1000),
        );
      }

      const issued = issueChallenge({
        purpose: challenge.purpose,
        phone: challenge.phone,
        userId: challenge.user_id,
        previous: challenge,
      });

      try {
        await deliver(challenge.phone, issued.code);
      } catch (error) {
        /* اگر پیامک نرفت، چالش قبلی باید همان کد قبلی را بپذیرد. */
        bumpChallenge(db, challenge.id, {
          code_hash: challenge.code_hash,
          expires_at: challenge.expires_at,
          attempts: challenge.attempts,
          resend_count: challenge.resend_count,
          last_sent_at: challenge.last_sent_at,
        });
        throw error;
      }

      return publicChallenge(config, findChallenge(db, issued.id));
    },

    async forgotPassword(body) {
      const phone = normalizePhone(requireString(body?.phone, "phone"));
      if (!phone) throw errors.phoneInvalid();

      const previous = challengeCooldown(phone, "reset");

      const user = findUserByPhone(db, phone);
      const eligible = Boolean(user?.verified_at);

      if (!eligible) {
        /* پاسخ یکسان با شمارهٔ موجود؛ کد واقعی نه ساخته می‌شود و نه می‌رود. */
        const at = now();
        const id = previous?.id ?? newId();
        const codeHash = hashCode(
          id,
          generateCode(otp.length),
          config.sessionSecret,
        );

        if (previous) {
          bumpChallenge(db, id, {
            code_hash: codeHash,
            expires_at: at + otp.ttlSeconds * 1000,
            attempts: 0,
            resend_count: Number(previous.resend_count ?? 0) + 1,
            last_sent_at: at,
          });
        } else {
          insertChallenge(db, {
            id,
            purpose: "reset",
            phone,
            userId: null,
            codeHash,
            expiresAt: at + otp.ttlSeconds * 1000,
            lastSentAt: at,
            createdAt: at,
          });
        }

        return publicChallenge(config, findChallenge(db, id));
      }

      const issued = issueChallenge({
        purpose: "reset",
        phone,
        userId: user.id,
        previous,
      });

      try {
        await deliver(phone, issued.code);
      } catch (error) {
        deleteChallenge(db, issued.id);
        throw error;
      }

      return publicChallenge(config, findChallenge(db, issued.id));
    },

    async resetPassword(body) {
      const challengeId = requireString(body?.challengeId, "challengeId");
      const code = requireString(body?.code, "code");
      const password = requireString(body?.password, "password");

      const challenge = findChallenge(db, challengeId);
      if (!challenge || challenge.purpose !== "reset" || challenge.consumed_at) {
        throw errors.challengeNotFound();
      }
      if (now() > challenge.expires_at) throw errors.codeExpired();
      if (challenge.attempts >= otp.maxAttempts) throw errors.tooManyAttempts();

      const expected = hashCode(challenge.id, code, config.sessionSecret);
      if (!safeEqualHex(expected, challenge.code_hash)) {
        const attempts = challenge.attempts + 1;
        bumpChallenge(db, challenge.id, { attempts });
        if (attempts >= otp.maxAttempts) throw errors.tooManyAttempts();
        throw errors.codeInvalid(otp.maxAttempts - attempts);
      }

      /* شمارهٔ ناموجود: کد را «مصرف‌شده» نکن تا رفتار با شمارهٔ واقعی
         تفاوت آشکار نداشته باشد، ولی اطلاعات هم لو نرود. */
      if (!challenge.user_id) throw errors.invalidCredentials();

      const issues = passwordIssues(password, challenge.phone);
      if (issues.length > 0) throw errors.passwordInvalid(issues.join(","));

      const passwordHash = await hashPassword(password);
      const at = new Date(now()).toISOString();
      const user = updateUser(db, challenge.user_id, {
        password_hash: passwordHash,
        verified_at: findUserById(db, challenge.user_id)?.verified_at ?? at,
      });

      bumpChallenge(db, challenge.id, { consumed_at: now() });
      consumeChallenges(db, challenge.phone, "reset", now());
      deleteUserSessions(db, challenge.user_id);

      return { user: publicUser(user), session: createSession(user.id) };
    },

    async updateProfile(userId, body) {
      const user = findUserById(db, userId);
      if (!user || !user.verified_at) throw errors.unauthorized();

      const patch = {};
      if (body?.name !== undefined) {
        const name = cleanName(body.name);
        const problem = nameIssue(name);
        if (problem) throw errors.badRequest(`name_${problem}`);
        patch.name = name;
      }

      if (body?.level !== undefined) {
        if (!LEVELS.has(body.level)) throw errors.badRequest("level_invalid");
        patch.level = body.level;
      }

      if (body?.goal !== undefined) {
        if (!GOALS.has(body.goal)) throw errors.badRequest("goal_invalid");
        patch.goal = body.goal;
      }

      if (body?.avatar !== undefined) {
        if (!AVATARS.has(body.avatar)) throw errors.badRequest("avatar_invalid");
        patch.avatar = body.avatar;
      }

      if (body?.bio !== undefined) {
        const bio = typeof body.bio === "string" ? body.bio.trim() : "";
        if (bio.length > BIO_MAX) throw errors.badRequest("bio_too_long");
        patch.bio = bio || null;
      }

      if (body?.dailyMinutes !== undefined) {
        const minutes = Number(body.dailyMinutes);
        if (!DAILY_MINUTES.has(minutes)) {
          throw errors.badRequest("daily_minutes_invalid");
        }
        patch.daily_minutes = minutes;
      }

      const nextLevel = patch.level ?? user.level;
      const nextGoal = patch.goal ?? user.goal;
      if (nextLevel && nextGoal && !user.onboarded_at) {
        patch.onboarded_at = new Date(now()).toISOString();
      }

      const updated = updateUser(db, userId, patch);
      return publicUser(updated);
    },

    purge() {
      purgeExpired(db, now());
    },
  };
}
