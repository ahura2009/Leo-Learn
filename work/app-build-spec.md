# Leo Learn — مشخصات ساخت اپ (`/App`)

این سند برای برنامه‌نویسی است. اگر خواستی پیاده‌سازی را بسپاری، همین فایل را
بده. هر چیزی که اینجا تصمیم گرفته شده، نهایی است؛ بخش «تصمیم‌های قفل‌شده»
خلاصهٔ آن‌ها است.

---

## ۰) تصمیم‌های قفل‌شده

| موضوع | تصمیم |
|---|---|
| سناریوی اول | **سفارش در کافه** (A1، ۱۱ دقیقه) |
| صدا در نسخهٔ ۱ | **TTS مرورگر** (`SpeechSynthesis`)، فقط برای انگلیسی |
| ضبط صدا و مقایسهٔ تلفظ | نسخهٔ ۲ — در v1 نیست |
| چت آزاد با لئو | نسخهٔ ۲ — در v1 نیست |
| منبع محتوا | فایل JSON داخل ریپو؛ کد از محتوا جدا |
| پیشرفت | `localStorage`؛ بدون سرور، بدون حساب واقعی |
| ثبت‌نام | محلی (نام + هدف + سطح)؛ بدون رمز و بدون ایمیل |
| تم | تیرهٔ لندینگ (سرمه‌ای/طلایی)، موبایل‌فرست، RTL |
| زبان UI | فارسی؛ محتوای انگلیسی با `dir="ltr"` |

---

## ۱) لینک‌ها و مسیرها

سایت روی GitHub Pages زیر base path سرو می‌شود:
`basePath = "/Leo-Learn"` (از `NEXT_PUBLIC_BASE_PATH`؛ همان الگوی `lib/asset-path.ts`).

| مسیر در کد | URL آنلاین | کار |
|---|---|---|
| `app/page.tsx` (موجود) | `https://ahura2009.github.io/Leo-Learn/` | لندینگ |
| `app/App/page.tsx` | `/Leo-Learn/App/` | صفحهٔ **امروز** |
| `app/App/onboarding/page.tsx` | `/Leo-Learn/App/onboarding/` | خوش‌آمد، نام، سطح، هدف |
| `app/App/path/page.tsx` | `/Leo-Learn/App/path/` | مسیر و فهرست سناریوها |
| `app/App/scenario/[slug]/page.tsx` | `/Leo-Learn/App/scenario/cafe-order/` | پیش‌نمایش سناریو |
| `app/App/scenario/[slug]/lesson/page.tsx` | `/Leo-Learn/App/scenario/cafe-order/lesson/` | بازیکن درس |
| `app/App/progress/page.tsx` | `/Leo-Learn/App/progress/` | پیشرفت |
| `app/App/profile/page.tsx` | `/Leo-Learn/App/profile/` | پروفایل و تنظیمات |

قواعد مسیر:

- نام پوشه **`App` با A بزرگ** است، چون URL خواسته‌شده `/App` است؛ GitHub Pages
  به بزرگی و کوچکی حرف حساس است. روی ویندوز پوشهٔ `App` و `app` یکی حساب
  می‌شوند ولی مسیر Next از نام پوشه ساخته می‌شود، پس همین `App` را بساز.
- `output: "export"` + `trailingSlash: true` یعنی همهٔ این صفحه‌ها استاتیک
  پیش‌ساخته می‌شوند. برای `[slug]` باید `generateStaticParams()` هر شش سناریو
  را برگرداند.
- هیچ redirect سمت سرور ممکن نیست. هر جا انتقال لازم است، `router.push` یا
  `router.replace` سمت کلاینت.
- لینک‌های داخلی با `next/link` (basePath را خودش اضافه می‌کند). هر جایی که
  `window.location` مستقیم ست می‌شود، basePath را دستی اضافه کن.

### ورود از لندینگ

- `components/layout/Header.tsx` → دکمهٔ «ثبت‌نام / ورود» به `/App/onboarding`
  لینک شود (الان `#scenarios` است).
- `components/sections/Hero.tsx` → دکمهٔ «رایگان شروع کن!» به `/App/onboarding`.
- کارت‌های `Scenarios.tsx` → هر کارتی که `slug` دارد به
  `/App/scenario/<slug>/` برود. کارت‌های بدون سناریوی نوشته‌شده فعلاً به
  `/App/path` بروند.
- بخش FAQ: لینک «نسخهٔ نمایشی» اگر جایی اضافه شد → `/App/onboarding`.

### جریان ثبت‌نام → اپ

1. هر ورودی اپ (`/App/...`) اول `leo-learn:profile` را می‌خواند.
2. اگر پروفایل نبود → `router.replace("/App/onboarding")`.
3. اگر بود → همان صفحه رندر می‌شود.
4. پایان onboarding → `router.replace("/App")` و کارت کافه با دکمهٔ شروع.
5. onboarding شامل ۳ مرحله در **یک صفحه** است (نه سه روت): نام → سطح →
   هدف؛ یک نوار پیشرفت بالای صفحه. دکمهٔ «بعدی» فقط وقتی فعال است که همان
   مرحله پر شده.

---

## ۲) داده: سناریو

فایل: `app/App/data/scenarios/cafe-order.json` … یک فایل برای هر سناریو.

```ts
type Level = "A1" | "A2" | "B1";
type Scenario = {
  slug: string;            // یکتا، kebab-case، همان نام فایل
  level: Level;
  title: string;           // «سفارش در کافه»
  minutes: number;         // ۱۱
  setting: string;         // «یک کافهٔ کوچک در لندن»
  story: string;           // ۲–۳ خط داستان برای پیش‌نمایش
  goal: string;            // انگلیسی، «I can order a drink and ask how much it costs.»
  goalFa: string;          // «می‌توانم سفارش بدهم و قیمت را بپرسم.»
  phras: Phrase[];         // دقیقاً ۳
  words: Phrase[];         // ۲ تا ۳
  steps: Step[];
};
type Phrase = { en: string; fa: string };

type Step =
  | { type: "listen"; lines: Line[] }                       // ۴–۶ خط
  | { type: "choose"; promptFa: string; options: string[]; answer: number; noteFa?: string }
  | { type: "build"; promptFa: string; tiles: string[]; answer: string; noteFa?: string }
  | { type: "roleplay"; turns: Turn[] };                    // ۳ تا ۴ نوبت
type Line = { who: "leo" | "you"; en: string; fa: string };
type Turn = {
  leo: string;                    // انگلیسی
  leoFa: string;                  // معنی
  target: string;                 // پاسخ هدف
  accept: string[];               // کلیدواژه‌ها (حداقل ۲، لزوماً در target نیستند)
  nudges: string[];               // دو راهنما، به فارسی، از کلی به دقیق
};
```

مراحل درس همیشه به این ترتیب‌اند و بازیکن همین را دنبال می‌کند:
`listen → choose → build → roleplay → result`.

### سناریوهای نسخهٔ ۱

| slug | عنوان | سطح | لئو در نقش |
|---|---|---|---|
| `cafe-order` | سفارش در کافه | A1 | گارسون |
| `supermarket` | خرید در سوپرمارکت | A1 | صندوق‌دار |
| `first-meeting` | آشنایی با یک نفر تازه | A1 | همکار در مهمانی |
| `hotel-booking` | رزرو هتل | A2 | پذیرش هتل |
| `phone-call` | تماس تلفنی | A2 | منشی دفتر |
| `job-interview` | مصاحبهٔ کاری | B1 | مصاحبه‌گر |

محتوای `cafe-order` در همین گفت‌وگو آماده است (مرحلهٔ گفت‌وگو با پاسخ هدف و
ناج‌ها)؛ در پیاده‌سازی همان را داخل JSON بگذار. بقیهٔ پنج سناریو در همین قالب
نوشته می‌شوند؛ اگر نبودند، مسیر فقط کافه را فعال نشان بدهد و بقیه «به‌زودی».

---

## ۳) داده: پیشرفت

کلیدها در `localStorage` با try/catch (private mode ممکن است خطا بدهد).

```ts
const PROFILE_KEY = "leo-learn:profile";
const PROGRESS_KEY = "leo-learn:progress";

type Profile = {
  name: string;
  level: Level;
  goal: "travel" | "work" | "daily";
  createdAt: string;  // ISO
  onboardedAt: string;
};

type Progress = {
  version: 2;
  scenarios: Record<string, {
    stepIndex: number;            // کدام Step
    chooseAnswers: Record<number, number>;
    buildAnswer: Record<number, string>;
    turns: { turnIndex: number; attempts: number; done: boolean }[];
    startedAt: string;
    completedAt?: string;
  }>;
  words: Record<string, { fa: string; seen: number; lastSeenAt: string }>;
  days: string[];                 // تاریخ‌های «YYYY-MM-DD» با تمرین
  streak: number;                 // روزهای پیوسته تا امروز
};
```

قواعد:

- نسخهٔ قبلی `leo-learn:progress` (دموی قدیمی) را اگر `version` نداشت، به
  نسخهٔ ۲ نادیده بگیر (پاک کن). مهاجرت لازم نیست.
- `days` و `streak` هر بار که یک Step با موفقیت تمام می‌شود به‌روز می‌شوند،
  ولی یک بار در روز؛ تکرار همان روز `streak` را بالا نمی‌برد.
- هر تغییر بلافاصله ذخیره می‌شود، نه در پایان درس — کاربر ممکن است وسط کار
  خروج کند.
- واژه‌ها وقتی وارد می‌شوند که درس تمام شود (مرحلهٔ نتیجه) — همان `words`
  سناریو.

---

## ۴) بازیکن درس

### وضعیت

- `scenario` (از JSON)، `stepIndex`، `attempt` (در هر Step از صفر)،
  `turnsDone`، `nudgesUsed` (۰ تا ۲ در هر نوبت).
- ورود به درس با `stepIndex` ذخیره‌شده ادامه می‌دهد؛ در مرحلهٔ گفت‌وگو از
  همان `turnIndex` که مانده.
- دکمهٔ «خروج» (→) همیشه بالای صفحه، بدون سؤال تأیید. برگشت به پیش‌نمایش.

### صفحه‌آرایی

- عرض محتوا حداکثر `480px`، وسط‌چین. روی گوشی تمام‌عرض با گاتر ۱۶px.
- بالا: فلش برگشت، نقطه‌های مرحله (۵ نقطه، مرحلهٔ جاری طلایی)، شمارهٔ مرحله.
- پایین: دکمهٔ اصلی تمام‌عرض؛ در مراحل تعاملی تا وقتی جواب خالی است غیرفعال.
- دکمه‌های ثانویه («راهنما»، «شنیدن»، «دوباره») کم‌رنگ و زیر دکمهٔ اصلی.
- کلید اصلی صفحه هم دکمهٔ اصلی را بزند (Camera-style: Enter در ورودی).

### هر Step

**listen** — خطوط یکی‌یکی با تأخیر ۶۰۰ms وارد می‌شوند؛ روی هر کلمهٔ انگلیسی
بزنی معنی همان خط زیرش نشان داده می‌شود. بعد از نمایش همهٔ خطوط دکمهٔ
«ادامه» فعال است. دکمهٔ «پخش» کل دیالوگ را با TTS می‌خواند (اگر مرورگر
`speechSynthesis` نداشت، دکمه نیست).

**choose** — گزینه‌ها به فارسی. انتخاب کاربر → اگر درست: `noteFa` سبزآرام و
دکمه «ادامه»؛ اگر غلط: همان `noteFa` + گزینهٔ درست مشخص می‌شود و «دوباره»
هم هست. تعداد تلاش ذخیره می‌شود ولی روی نتیجه اثری ندارد.

**build** — استخر کاشی‌ها shuffled، کاربر با کلیک کاشی را به جملهٔ خودش
می‌برد و می‌تواند برگرداند. «بررسی»: مقایسهٔ رشته — اگر مساوی `answer`
بود، تمام؛ اگر نه، یک تفاوت اول را به فارسی بگو («نزدیک بودی — `please`
آخر جمله می‌آید.»). «راهنما»: کاشی درست بعدی چشمک می‌زند؛ محدودیت ندارد.
انگلیسی همه‌جا `dir="ltr"`.

**roleplay** — هر نوبت:
1. حباب لئو با `leo` (+ دکمهٔ شنیدن). اگر اولین نوبت است، `leoFa` محو زیرش.
2. ورودی پاسخ، `dir="ltr"`، با ۲–۳ چیپ شروع جمله (از `target`: دو کلمهٔ اول
   و یک عبارت جایگزین مثل `Could I…`).
3. «بفرست»: اگر جواب خالی/کوتاه‌تر از ۲ کلمه → ناج ۱ بدون ثبت تلاش.
4. ارزیابی جواب (بخش ۵). سه حالت:
   - **پذیرش** → حباب لئو با پاسخ بعدی؛ `turnIndex++`.
   - **نزدیک** → ناج بعدی؛ `nudgesUsed++`.
   - **نافرجام** (۲ ناج مصرف شد) → `target` در یک کارت «اینجوری بگو» نشان
     داده شود و کاربر همان را تایپ کند؛ بعد پذیرفته می‌شود و نوبت جلو می‌رود
     (این هم تمرین است، نه شکست).
5. هیچ‌جا ضربدر، صدای خطا یا کلمهٔ «غلط» نمی‌آید.

**result** — فقط وقتی مرحلهٔ گفت‌وگو تمام شد. سه `phras` با دکمهٔ شنیدن،
`words`، کارت سناریوی بعدی (بر اساس ترتیب جدول)، دکمهٔ «خانه». همین‌جا
`completedAt` و `words` در پیشرفت ثبت می‌شوند.

---

## ۵) منطق لئو (نسخهٔ ۱)

هوش واقعی نیست. یک تابع خالص:

```ts
function judge(input: string, turn: Turn): "accept" | "close" | "off";
```

1. نرمال‌سازی: حروف کوچک، حذف علائم و فاصله‌های اضافه، `’` → `'`.
2. اگر هر عبارت `accept` داخل ورودی بود → **accept**.
3. وگرنه شباهت توکنی با `target`: `common / targetTokens`؛ اگر ≥ ۰.۶ →
   **accept**؛ اگر ≥ ۰.۲۵ → **close**؛ وگرنه **off**.
4. **off**: ناج ۰ (از `nudges`)، بدون افزایش `nudgesUsed` — لئو فقط یک
   جملهٔ ثابت «با این جمله شروع کن» می‌گوید.
5. `accept` خارج از نوبت‌های تعریف‌شده در نسخهٔ ۱ پاسخ داده نمی‌شود؛ ورودی
   فقط در چرخهٔ همان نوبت معنی دارد.

تست واحد برای این تابع اجباری است: سه نمونه ورودی (`"latte"`،
`"can i get a latte"`، `"how much"`) و انتظار هر سه حالت.

---

## ۶) کامپوننت‌ها و فایل‌ها

```
app/App/
  layout.tsx                 # شل اپ: تم، AppProvider (profile+progress)
  page.tsx                   # امروز
  onboarding/page.tsx
  path/page.tsx
  progress/page.tsx
  profile/page.tsx
  scenario/[slug]/page.tsx
  scenario/[slug]/lesson/page.tsx
  data/scenarios/*.json
  lib/types.ts               # تایپ‌های بخش ۲ و ۳
  lib/storage.ts             # read/write/clear با try/catch، نسخه‌بندی
  lib/leo.ts                 # judge + tokens
  lib/tts.ts                 # speak(text, rate) با بررسی پشتیبانی
  hooks/useProgress.ts
  components/AppShell.tsx     # هدر + نوار پایین ۴تایی
  components/BottomNav.tsx
  components/StepDots.tsx
  components/PhraseCard.tsx
  components/SpeakButton.tsx
  components/lesson/ListenStep.tsx
  components/lesson/ChooseStep.tsx
  components/lesson/BuildStep.tsx
  components/lesson/RoleplayStep.tsx
  components/lesson/ResultStep.tsx
```

- نوار پایین ۴ جا: **خانه / مسیر / پیشرفت / پروفایل**. در صفحهٔ درس دیده
  نمی‌شود.
- استایل: CSS Module برای هر کامپوننت، مثل لندینگ. توکن‌ها از
  `app/globals.css` می‌آیند؛ رنگ جدید تعریف نکن. اگر تایپوگرافی اپ کمی
  جمع‌تر است، یک متغیر `--app-width` در روت `app/App` تعریف کن.
- دکمه/کارت/چیپ‌ها همان زبان بصری لندینگ: پس‌زمینهٔ `--surface`، حاشیهٔ
  `--hairline`، تأکید `--gold`، و متن ثانویه `--text-secondary`.
- آیکون‌ها: همان SVG خطی لندینگ (stroke 1.8)، بدون کتابخانهٔ آیکون.

---

## ۷) صفحه‌ها — حداقل محتوا

**امروز (`/App`)** — سلام + نام، روز پیوسته، کارت سناریوی نصفه (عنوان،
سطح، نوار پیشرفت، «ادامه بده»)، کارت «قدم بعدی» (رنگ متفاوت، بدون تصویر)،
و دکمهٔ اصلی. کاربر تازه: کارت کافه با «اولین سناریو را شروع کن».

**مسیر (`/App/path`)** — فهرست عمودی سناریوها به ترتیب سطح. هر ردیف:
تصویر (public/images/scenarios یا پلیس‌هولدر)، عنوان، سطح، زمان، وضعیت
(شروع‌نشده / نصفه / تمام‌شده).

**پیش‌نمایش (`/App/scenario/[slug]`)** — تصویر صحنه، سطح، زمان، `story`،
`goalFa` به‌صورت برجسته، سه `phras` با معنی و شنیدن، دکمهٔ «شروع درس» /
«ادامه بده» اگر نصفه است.

**پیشرفت (`/App/progress`)** — سه عدد: سناریوی تمام‌شده، واژهٔ تمرین‌شده،
روز پیوسته. فهرست سناریوهای تمام‌شده با تاریخ. فهرست واژه‌ها با دکمهٔ
شنیدن. هیچ نمودار یا امتیاز چهارمی.

**پروفایل (`/App/profile`)** — نام (قابل ویرایش)، سطح، هدف، تعداد درس‌های
انجام‌شده، دکمهٔ «پاک کردن پیشرفت» با تأیید درون‌صفحه (نه `confirm()`
مرورگر).

**onboarding** — سه گام در یک صفحه: نام → سطح (A1/A2/B1 با توضیح یک‌خطی) →
هدف (سفر / کار / روزمره). نوار پیشرفت بالا. ذخیره در `PROFILE_KEY` و انتقال
به `/App`.

---

## ۸) معیار پذیرش

پس از پیاده‌سازی، همهٔ این‌ها باید درست باشند:

1. `npm run build` با و بدون `NEXT_PUBLIC_BASE_PATH=/Leo-Learn` سبز است.
2. با base path، این لینک‌ها بالای صفحه الکترونیکی باز می‌شوند:
   `/Leo-Learn/`، `/Leo-Learn/App/`، `/Leo-Learn/App/onboarding/`،
   `/Leo-Learn/App/path/`، `/Leo-Learn/App/progress/`،
   `/Leo-Learn/App/scenario/cafe-order/`،
   `/Leo-Learn/App/scenario/cafe-order/lesson/`.
3. از لندینگ، «ثبت‌نام / ورود» → onboarding → نام/سطح/هدف → `/App` بدون
   خطای ۴۰۴.
4. کاربر بدون پروفایل که مستقیم `/App` را باز می‌کند، به onboarding می‌رود.
5. کافه تا مرحلهٔ ۳ می‌رود، صفحه بسته می‌شود، باز شدن دوباره → مرحلهٔ ۳.
6. جواب غلط در build → یک نکتهٔ فارسی، «دوباره» کار می‌کند، و بعد از درست
   شدن مرحله جلو می‌رود.
7. در roleplay، ورودی «latte» → ناج؛ «can i get a latte» → پذیرش؛
   «how much is it» → پذیرش (طبق `accept` کلیدواژه‌ها).
8. پایان درس → صفحهٔ نتیجه، سناریو در پیشرفت تمام‌شده، واژه‌ها اضافه شده.
9. رفرش صفحهٔ نتیجه، همان را نشان می‌دهد و دوباره ثبت نمی‌کند.
10. روی عرض ۳۶۰px هیچ اسکرول افقی در کل `/App` نیست.
11. همهٔ جمله‌های انگلیسی `dir="ltr"` دارند (در جملهٔ فارسی که انگلیسی وسطش
    هست، علامت سؤال جای راست می‌ماند).
12. `prefers-reduced-motion` انیمیشن ورود خطوط و پالس راهنما را خاموش می‌کند.
13. `npx tsc --noEmit` و `npm run lint` بدون خطا.

---

## ۹) خارج از نسخهٔ ۱

- ضبط صدا، مقایسهٔ تلفظ، تصحیح گرامر آزاد
- چت آزاد با لئو
- حساب واقعی، پرداخت، سرور، پایگاه داده
- یادگیری فاصله‌دار (SRS) برای واژه‌ها — فقط بازگشت واژه‌ها در سناریوی بعد
- حالت روشن — تم تیرهٔ برند است
- بیش از شش سناریو

---

## ۱۰) ترتیب کار

1. `lib/types.ts`، `lib/storage.ts`، `lib/leo.ts` + تست‌های `judge`.
2. `cafe-order.json` با محتوای موجود.
3. `app/App/layout.tsx` + `AppShell` + `BottomNav` + onboarding.
4. صفحهٔ امروز، پیش‌نمایش، مسیر.
5. بازیکن درس: listen → choose → build → roleplay → result.
6. پیشرفت + پروفایل + اتصال دکمه‌های لندینگ.
7. پنج سناریوی دیگر.
8. TTS + بازبینی معیارهای پذیرش.
