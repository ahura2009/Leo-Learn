import assert from "node:assert/strict";
import { test } from "node:test";
import { loadConfig } from "./config.mjs";
import { createSmsSender } from "./sms.mjs";

/* provider مدیانا: شکل درخواست و رفتار خطا، بدون تماس واقعی با شبکه. */

function withFetch(handler, fn) {
  const original = globalThis.fetch;
  globalThis.fetch = handler;
  return fn().finally(() => {
    globalThis.fetch = original;
  });
}

test("config: provider مدیانا بدون کلید خطا می‌دهد", () => {
  assert.throws(
    () => loadConfig({ AUTH_SMS_PROVIDER: "mediana" }),
    /MEDIANA_API_KEY and MEDIANA_PATTERN_CODE are required/,
  );
});

test("config: provider مدیانا با کلید و الگو پذیرفته می‌شود", () => {
  const config = loadConfig({
    AUTH_SMS_PROVIDER: "mediana",
    MEDIANA_API_KEY: "test-key",
    MEDIANA_PATTERN_CODE: "110022",
  });
  assert.equal(config.sms.provider, "mediana");
  assert.equal(config.sms.medianaApiKey, "test-key");
  assert.equal(config.sms.medianaPatternCode, "110022");
  assert.equal(config.sms.medianaBaseUrl, "https://api.mediana.ir");
});

test("sms: مدیانا درخواست OTP را درست می‌سازد", async () => {
  const requests = [];
  const sender = createSmsSender({
    provider: "mediana",
    medianaApiKey: "secret-key",
    medianaPatternCode: "110022",
    medianaBaseUrl: "https://api.mediana.ir",
  });

  await withFetch(
    async (url, init) => {
      requests.push({ url, init, body: JSON.parse(init.body) });
      return new Response(
        JSON.stringify({
          meta: { code: "OK", errorMessage: null },
          data: { succeed: true, message: "در حال ساخت" },
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      );
    },
    () => sender({ phone: "+989121234567", code: "48213" }),
  );

  assert.equal(requests.length, 1);
  const [request] = requests;
  assert.equal(request.url, "https://api.mediana.ir/sms/v1/send/otp");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers["X-API-KEY"], "secret-key");
  assert.deepEqual(request.body, {
    patternCode: "110022",
    recipient: "989121234567",
    otpCode: "48213",
  });
});

test("sms: پیام خطای مدیانا در meta به exception تبدیل می‌شود", async () => {
  const sender = createSmsSender({
    provider: "mediana",
    medianaApiKey: "secret-key",
    medianaPatternCode: "110022",
    medianaBaseUrl: "https://api.mediana.ir",
  });

  await assert.rejects(
    withFetch(
      async () =>
        new Response(
          JSON.stringify({
            meta: {
              code: "BadRequest",
              errorMessage: "پترن مورد نظر یافت نشد",
            },
            data: null,
          }),
          { status: 400, headers: { "content-type": "application/json" } },
        ),
      () => sender({ phone: "+989121234567", code: "48213" }),
    ),
    /Mediana error BadRequest: پترن مورد نظر یافت نشد/,
  );
});

test("sms: succeed=false هم خطا حساب می‌شود", async () => {
  const sender = createSmsSender({
    provider: "mediana",
    medianaApiKey: "secret-key",
    medianaPatternCode: "110022",
    medianaBaseUrl: "https://api.mediana.ir",
  });

  await assert.rejects(
    withFetch(
      async () =>
        new Response(
          JSON.stringify({
            meta: { code: "OK", errorMessage: null },
            data: { succeed: false, message: "شماره در لیست سیاه است" },
          }),
          { status: 200, headers: { "content-type": "application/json" } },
        ),
      () => sender({ phone: "+989121234567", code: "48213" }),
    ),
    /Mediana rejected the message/,
  );
});
