# اتصال پیامک OTP به مدیانا

مدیانا سرویس پیامک با API Key کار می‌کند و برای OTP یک مسیر اختصاصی دارد.
سرور auth این پروژه حالا provider `mediana` را پشتیبانی می‌کند.

## چه چیزی از پنل مدیانا لازم است

| مقدار | از کجا |
|---|---|
| `MEDIANA_API_KEY` | پنل مدیانا → بخش API / تنظیمات → کلید API |
| `MEDIANA_PATTERN_CODE` | پنل مدیانا → الگوهای پیامک → کد الگوی OTP |

الگو باید یک متغیر برای کد داشته باشد. در مسیر `Send OTP`، مدیانا کد را در
فیلد `otpCode` می‌گیرد و خودش داخل الگو جای‌گذاری می‌کند.

## درخواستی که سرور می‌فرستد

```
POST https://api.mediana.ir/sms/v1/send/otp
X-API-KEY: <کلید>
Content-Type: application/json

{ "patternCode": "110022", "recipient": "989121234567", "otpCode": "48213" }
```

شماره به شکل ملی بدون `+` فرستاده می‌شود.

## تنظیم

در `.env.local` (یا متغیرهای سرور):

```bash
AUTH_SMS_PROVIDER=mediana
MEDIANA_API_KEY=کلید-خودت
MEDIANA_PATTERN_CODE=کد-الگو
```

سپس:

```bash
npm run auth:server
```

در لاگ باید `(sms: mediana)` ببینی. اگر کلید یا کد الگو نباشد، سرور
هنگام بالا آمدن با پیام روشن متوقف می‌شود.

## تست بدون مصرف اعتبار

اول با همان کلید یک درخواست دستی بزن تا مطمئن شوی الگو و کلید درست‌اند:

```bash
curl -X POST https://api.mediana.ir/sms/v1/send/otp \
  -H "X-API-KEY: کلید-خودت" \
  -H "Content-Type: application/json" \
  -d '{"patternCode":"کد-الگو","recipient":"989121234567","otpCode":"12345"}'
```

پاسخ موفق: `meta.code` برابر `OK` و `data.succeed` برابر `true`.
اگر پیام «پترن مورد نظر یافت نشد» گرفتی، `patternCode` یا مالکیت الگو
درست نیست.

## نکته‌های عملی

- سرور auth باید به اینترنت و `api.mediana.ir` دسترسی داشته باشد؛ اگر
  روی سرور ایران است، معمولاً بدون مشکل است.
- برای پراکسی محلی اگر نیاز شد: `MEDIANA_BASE_URL` را تغییر بده
  (پیش‌فرض `https://api.mediana.ir`).
- محدودیت‌های نرخ در خود سرور auth اعمال می‌شود: فاصلهٔ ارسال دوباره،
  تعداد تلاش کد و TTL. این‌ها در `.env` قابل تنظیم‌اند.
- اگر خطای «No active plan found» (کد ۱۰۳۲) گرفتی، اعتبار پنل یا اشتراک
  فعال نیست.

مستندات رسمی: <https://apidoc.mediana.ir/>
