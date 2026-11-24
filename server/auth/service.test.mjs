import assert from "node:assert/strict";
import { test } from "node:test";
import { openDatabase } from "./db.mjs";
import { createAuthService } from "./service.mjs";

function makeService() {
  const db = openDatabase(":memory:");
  const codes = [];
  const config = {
    production: false,
    sessionSecret: "test-secret-0123456789abcdef0123456789",
    otp: {
      length: 6,
      ttlSeconds: 300,
      resendCooldownSeconds: 60,
      maxAttempts: 5,
    },
    session: { ttlDays: 30, cookieName: "leo_auth", secure: false },
    sms: { provider: "console" },
  };

  const service = createAuthService({
    db,
    config,
    sms: async ({ code }) => {
      codes.push(code);
    },
    logger: { info() {}, warn() {}, error() {} },
  });

  return { db, codes, service, config };
}

const phone = "+989121234567";
const password = "Mojtaba123";

test("ثبت‌نام: کد پیامکی، تلاش اشتباه و ورود", async () => {
  const { service, codes } = makeService();

  const challenge = await service.signUpStart({
    name: "سارا",
    phone: "09121234567",
    password,
  });
  assert.equal(challenge.purpose, "signup");
  assert.equal(challenge.phone, phone);
  assert.equal(codes.length, 1);

  const wrong = codes[0] === "000000" ? "111111" : "000000";
  await assert.rejects(
    () => service.signUpVerify({ challengeId: challenge.challengeId, code: wrong }),
    (error) => error.code === "CODE_INVALID" && error.attemptsLeft === 4,
  );

  const result = await service.signUpVerify({
    challengeId: challenge.challengeId,
    code: codes[0],
  });
  assert.equal(result.user.phone, phone);
  assert.equal(result.user.name, "سارا");
  assert.equal(result.user.onboardedAt, null);
  assert.ok(result.session.token.length > 20);

  const current = await service.session(result.session.token);
  assert.equal(current.user.id, result.user.id);
});

test("شمارهٔ تکراری ثبت‌نام نمی‌شود ولی رمز اشتباه لو نمی‌دهد", async () => {
  const { service, codes } = makeService();

  const challenge = await service.signUpStart({
    name: "سارا",
    phone,
    password,
  });
  await service.signUpVerify({ challengeId: challenge.challengeId, code: codes[0] });

  await assert.rejects(
    () => service.signUpStart({ name: "دیگری", phone, password }),
    (error) => error.code === "PHONE_TAKEN",
  );

  await assert.rejects(
    () => service.signIn({ phone, password: "WrongPass1" }),
    (error) => error.code === "INVALID_CREDENTIALS",
  );

  await assert.rejects(
    () => service.signIn({ phone: "+989129999999", password }),
    (error) => error.code === "INVALID_CREDENTIALS",
  );

  const ok = await service.signIn({ phone, password });
  assert.equal(ok.user.phone, phone);
});

test("قفل موقت پس از تلاش‌های ناموفق", async () => {
  const { service, codes } = makeService();

  const challenge = await service.signUpStart({
    name: "سارا",
    phone,
    password,
  });
  await service.signUpVerify({ challengeId: challenge.challengeId, code: codes[0] });

  for (let index = 0; index < 6; index += 1) {
    await assert.rejects(
      () => service.signIn({ phone, password: "WrongPass1" }),
      (error) => error.code === "INVALID_CREDENTIALS",
    );
  }

  await assert.rejects(
    () => service.signIn({ phone, password }),
    (error) => error.code === "ACCOUNT_LOCKED" && error.retryAfterSeconds > 0,
  );
});

test("ارسال دوباره پیش از پایان شمارش معکوس رد می‌شود", async () => {
  const { service } = makeService();

  const challenge = await service.signUpStart({
    name: "سارا",
    phone,
    password,
  });

  await assert.rejects(
    () => service.resend({ challengeId: challenge.challengeId }),
    (error) => error.code === "RATE_LIMITED" && error.retryAfterSeconds > 0,
  );
});

test("بازیابی رمز: شمارهٔ ناموجود و شمارهٔ واقعی", async () => {
  const { service, codes } = makeService();

  const unknown = await service.forgotPassword({ phone: "+989129999999" });
  assert.equal(unknown.purpose, "reset");
  assert.equal(codes.length, 0, "برای شمارهٔ ناموجود پیامکی نمی‌رود");

  const signup = await service.signUpStart({
    name: "سارا",
    phone,
    password,
  });
  await service.signUpVerify({ challengeId: signup.challengeId, code: codes[0] });

  const before = await service.signIn({ phone, password });

  const reset = await service.forgotPassword({ phone });
  const resetCode = codes.at(-1);
  const changed = await service.resetPassword({
    challengeId: reset.challengeId,
    code: resetCode,
    password: "NewPassw0rd",
  });
  assert.equal(changed.user.id, before.user.id);

  await assert.rejects(
    () => service.signIn({ phone, password }),
    (error) => error.code === "INVALID_CREDENTIALS",
  );

  await service.signIn({ phone, password: "NewPassw0rd" });

  /* نشست قبلی پس از تغییر رمز باید باطل شده باشد. */
  const old = await service.session(before.session.token);
  assert.equal(old, null);
});

test("onboarding با سطح و هدف کامل می‌شود", async () => {
  const { service, codes } = makeService();

  const challenge = await service.signUpStart({
    name: "سارا",
    phone,
    password,
  });
  const { user } = await service.signUpVerify({
    challengeId: challenge.challengeId,
    code: codes[0],
  });

  const withLevel = await service.updateProfile(user.id, { level: "A2" });
  assert.equal(withLevel.onboardedAt, null);

  const complete = await service.updateProfile(user.id, { goal: "travel" });
  assert.equal(complete.level, "A2");
  assert.ok(complete.onboardedAt);
});

test("ورودی نامعتبر رد می‌شود", async () => {
  const { service } = makeService();

  await assert.rejects(
    () => service.signUpStart({ name: "س", phone, password }),
    (error) => error.code === "BAD_REQUEST",
  );
  await assert.rejects(
    () => service.signUpStart({ name: "سارا", phone: "0912", password }),
    (error) => error.code === "PHONE_INVALID",
  );
  await assert.rejects(
    () => service.signUpStart({ name: "سارا", phone, password: "12345678" }),
    (error) => error.code === "PASSWORD_INVALID",
  );
});
