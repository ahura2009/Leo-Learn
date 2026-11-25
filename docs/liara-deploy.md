# استقرار Leo Learn روی لیارا

این پروژه دو برنامهٔ جدا لازم دارد:

| برنامه | پلتفرم | کار | منابع پیشنهادی |
|---|---|---|---|
| `leo-learn` | NextJS | همان سایت و اپ (رندر سروری) | مریخ، بستهٔ پایه |
| `leo-auth` | NodeJS | API احراز هویت + SQLite | زمین، بستهٔ پایه + دیسک ۱GB |

دلیل دو برنامه بودن: سایت باید `next build` بخورد و auth یک سرویس Node جدا با
دیسک دائمی برای SQLite است. هر دو به هم وصل می‌شوند اما کاربر فقط یکی
(`leo-learn`) را می‌بیند.

> **نکتهٔ کلیدی معماری.** زیردامنه‌های `*.liara.run` در فهرست Public Suffix
> هستند؛ پس دو برنامه «cross-site» حساب می‌شوند و کوکی `SameSite=Lax` بینشان
> ارسال نمی‌شود. به همین دلیل مرورگر فقط به `leo-learn` حرف می‌زند و Next
> درخواست‌های `/v1/*` را سمت سرور به `leo-auth` می‌فرستد (همان rewriteای که در
> `next.config.ts` هست). نتیجه: کوکی هم‌سایت می‌ماند و CORS لازم نیست.
> اگر بعداً دامنهٔ اختصاصی گرفتی، همین ساختار بدون تغییر کار می‌کند.

## ۰) پیش‌نیاز

```bash
npm install -g @liara/cli
liara login
liara network create        # شبکهٔ خصوصی، یک‌بار برای حساب/تیم
```

## ۱) برنامهٔ auth

در کنسول (پلتفرم → ایجاد برنامه):

- شناسه: `leo-auth`
- پلتفرم: **NodeJS**
- نسخه Node: **۲۴** (باید باشد؛ کد از `node:sqlite` استفاده می‌کند)
- منابع: **زمین** (۰.۵GB / ۰.۵CPU / ۵GB)
- بستهٔ امکانات: **پایه**

از بخش **دیسک‌ها** یک دیسک بساز:

- نام: `authdata`
- حجم: ۱GB
- اتصال به مسیر: `data` (در `server/auth/liara.json` هم همین آمده)

متغیرهای محیطی برنامه:

```bash
NODE_ENV=production
AUTH_HOST=0.0.0.0
AUTH_SESSION_SECRET=<یک رشتهٔ تصادفی حداقل ۳۲ کاراکتری>
AUTH_DB_PATH=data/auth.sqlite
AUTH_SMS_PROVIDER=mediana
MEDIANA_API_KEY=<کلید مدیانا>
MEDIANA_PATTERN_CODE=<کد الگوی OTP>
AUTH_ALLOWED_ORIGINS=https://leo-learn.liara.run
AUTH_COOKIE_SECURE=true
```

`PORT` را خود لیارا تزریق می‌کند؛ سرور از همان استفاده می‌کند (اگر
`AUTH_PORT` خالی باشد).

استقرار (از ریشهٔ مخزن):

```bash
cd server/auth
liara deploy --app leo-auth
```

پوشهٔ `server/auth` یک package.json و liara.json مستقل دارد و خودکفاست
(فقط از ماژول‌های داخلی Node استفاده می‌کند).

بررسی:

```bash
curl https://leo-auth.liara.run/v1/health
# {"ok":true}
```

## ۲) برنامهٔ سایت

در کنسول:

- شناسه: `leo-learn`
- پلتفرم: **NextJS**
- نسخه Node: **۲۴**
- منابع: **مریخ** — اگر build با کمبود حافظه شکست خورد، به **مشتری (۲GB)**
  ارتقا بده (صورت‌حساب ساعتی است، پس گران نمی‌افتد).

متغیرهای محیطی برنامه (قبل از استقرار بگذار، چون در زمان build خوانده می‌شوند):

```bash
AUTH_DEV_API_URL=https://leo-auth.liara.run
NEXT_PUBLIC_AUTH_API_URL=
```

مهم: `NEXT_PUBLIC_BASE_PATH` را **تنظیم نکن**؛ اگر تنظیم شود، پروژه به
export استاتیک تبدیل می‌شود و auth از کار می‌افتد. `NEXT_PUBLIC_AUTH_API_URL`
خالی می‌ماند تا مرورگر از مسیر هم‌سایت `/v1` استفاده کند.

استقرار:

```bash
liara deploy --app leo-learn
```

## ۳) آزمون نهایی (۵ دقیقه)

1. `https://leo-learn.liara.run/v1/health` → باید `{"ok":true}` بدهد.
2. `https://leo-learn.liara.run/App/sign-up` → ثبت‌نام با شمارهٔ خودت.
3. پیامک مدیانا باید برسد؛ کد را بزن.
4. onboarding را تمام کن، به `/App` باید برگردی و روی رفرش هم نشست
   باید بماند (کوکی HttpOnly).
5. خروج بزن و دوباره وارد شو.

## مسائل رایج

| نشانه | علت |
|---|---|
| `/v1/health` روی سایت ۴۰۴ می‌دهد | `AUTH_DEV_API_URL` در زمان build تنظیم نبوده؛ env را بگذار و دوباره deploy کن |
| صفحهٔ ورود «سرور در دسترس نیست» | `leo-auth` بالا نیامده یا `AUTH_HOST=0.0.0.0` نیست |
| ثبت‌نام ۵۰۰ می‌دهد | `AUTH_SESSION_SECRET` کوتاه است یا provider مدیانا کلید/الگو ندارد (لاگ برنامه را ببین) |
| داده بعد از ری‌استارت می‌پرد | دیسک ساخته نشده یا `AUTH_DB_PATH` روی دیسک نیست |
| build سایت خودکار ری‌استارت می‌شود | حافظهٔ مریخ کم است → مشتری |

## نقشهٔ پشتیبان: پلتفرم Docker

اگر پلتفرم NextJS لیارا با Next 16 مشکل داشت، در کنسول پلتفرم برنامه را به
**Docker** تغییر بده؛ `Dockerfile` و `.dockerignore` ریشهٔ پروژه همین سناریو
را پوشش می‌دهند و همان متغیرها بالا هستند.

## دامنهٔ اختصاصی (اختیاری)

یک دامنه به `leo-learn` وصل کن (مثلاً `leolearn.ir`) و
`AUTH_ALLOWED_ORIGINS` را به همان آدرس به‌روز کن. برای `leo-auth` نیازی به
دامنهٔ عمومی نیست؛ سایت در سمت سرور با آدرس `liara.run` به آن می‌رسد.
