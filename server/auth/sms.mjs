/* ارسال پیامک — هر provider یک قرارداد ساده.
   کد یک‌بارمصرف فقط از طریق همین لایه بیرون می‌رود؛ هیچ پاسخ HTTP
   کدی را برنمی‌گرداند. provider «console» فقط برای توسعه است. */

export function createSmsSender(sms, { logger = console } = {}) {
  if (sms.provider === "kavenegar") {
    return async ({ phone, code }) => {
      const url = new URL(
        `https://api.kavenegar.com/v1/${encodeURIComponent(
          sms.kavenegarApiKey,
        )}/verify/lookup.json`,
      );
      url.searchParams.set("receptor", phone.replace(/^\+/, ""));
      url.searchParams.set("token", code);
      url.searchParams.set("template", sms.kavenegarTemplate);
      if (sms.kavenegarSender) url.searchParams.set("sender", sms.kavenegarSender);

      const response = await fetch(url, { method: "GET" });
      if (!response.ok) {
        throw new Error(`Kavenegar responded ${response.status}`);
      }

      const body = await response.json().catch(() => null);
      if (body?.return?.status !== 200) {
        throw new Error(
          `Kavenegar error ${body?.return?.status ?? "unknown"}: ${
            body?.return?.message ?? ""
          }`,
        );
      }
    };
  }

  if (sms.provider === "mediana") {
    /* Mediana «Send OTP»: الگوی تعریف‌شده در پنل + کد به‌عنوان otpCode.
       شماره‌ها به شکل ملی بدون + فرستاده می‌شوند (989121234567). */
    return async ({ phone, code }) => {
      const response = await fetch(`${sms.medianaBaseUrl}/sms/v1/send/otp`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json",
          "X-API-KEY": sms.medianaApiKey,
        },
        body: JSON.stringify({
          patternCode: sms.medianaPatternCode,
          recipient: phone.replace(/^\+/, ""),
          otpCode: code,
        }),
      });

      const body = await response.json().catch(() => null);
      /* خطاها همیشه ۲۰۰ نیستند؛ هم وضعیت HTTP و هم meta.code را می‌سنجیم. */
      if (!response.ok || (body?.meta?.code && body.meta.code !== "OK")) {
        throw new Error(
          `Mediana error ${body?.meta?.code ?? response.status}: ${
            body?.meta?.errorMessage ?? ""
          }`,
        );
      }

      if (body?.data?.succeed === false) {
        throw new Error(`Mediana rejected the message: ${body?.data?.message ?? ""}`);
      }
    };
  }

  if (sms.provider === "webhook") {
    return async ({ phone, code }) => {
      const response = await fetch(sms.webhookUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(sms.webhookToken
            ? { authorization: `Bearer ${sms.webhookToken}` }
            : {}),
        },
        body: JSON.stringify({ phone, code }),
      });
      if (!response.ok) {
        throw new Error(`SMS webhook responded ${response.status}`);
      }
    };
  }

  /* توسعهٔ محلی: فقط در لاگ سرور. مرورگر هرگز کد را نمی‌بیند. */
  return async ({ phone, code }) => {
    logger.warn(
      `[auth] DEV SMS → ${phone}: ${code} (console provider; never enabled in production)`,
    );
  };
}
