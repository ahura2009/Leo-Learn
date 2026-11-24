/* خطاهای قابل‌نمایش به کلاینت. پیام انگلیسی فقط برای لاگ/دیباگ است؛
   رابط کاربری بر اساس code پیام فارسی خودش را می‌سازد. */

export class AuthError extends Error {
  constructor(code, status, extra = {}) {
    super(extra.message ?? code);
    this.name = "AuthError";
    this.code = code;
    this.status = status;
    this.retryAfterSeconds = extra.retryAfterSeconds;
    this.attemptsLeft = extra.attemptsLeft;
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.retryAfterSeconds !== undefined
          ? { retryAfterSeconds: this.retryAfterSeconds }
          : {}),
        ...(this.attemptsLeft !== undefined
          ? { attemptsLeft: this.attemptsLeft }
          : {}),
      },
    };
  }
}

export const errors = {
  badRequest: (message) => new AuthError("BAD_REQUEST", 400, { message }),
  phoneInvalid: () => new AuthError("PHONE_INVALID", 400),
  phoneTaken: () => new AuthError("PHONE_TAKEN", 409),
  passwordInvalid: (message) => new AuthError("PASSWORD_INVALID", 400, { message }),
  codeInvalid: (attemptsLeft) =>
    new AuthError("CODE_INVALID", 400, { attemptsLeft }),
  codeExpired: () => new AuthError("CODE_EXPIRED", 410),
  tooManyAttempts: () => new AuthError("TOO_MANY_ATTEMPTS", 429),
  rateLimited: (retryAfterSeconds) =>
    new AuthError("RATE_LIMITED", 429, { retryAfterSeconds }),
  challengeNotFound: () => new AuthError("CHALLENGE_NOT_FOUND", 404),
  invalidCredentials: () => new AuthError("INVALID_CREDENTIALS", 401),
  accountLocked: (retryAfterSeconds) =>
    new AuthError("ACCOUNT_LOCKED", 423, { retryAfterSeconds }),
  unauthorized: () => new AuthError("UNAUTHORIZED", 401),
  smsFailed: () => new AuthError("SERVER_ERROR", 502, { message: "sms_failed" }),
};
