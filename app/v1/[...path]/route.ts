import type { NextRequest } from "next/server";

/* پراکسی /v1/* به سرور احراز هویت.
   مرورگر فقط با همین مبدأ حرف می‌زند، پس کوکی نشست SameSite=Lax می‌ماند و
   CORS لازم نیست. عمداً Route Handler است و نه rewrite در next.config:
   برخی پلتفرم‌ها (مثل لیارا) فایل config را هنگام build بازنویسی می‌کنند. */

const target = (
  process.env.AUTH_PROXY_TARGET ??
  process.env.AUTH_DEV_API_URL ??
  "http://127.0.0.1:8787"
).replace(/\/+$/, "");

/* خروجی استاتیک (GitHub Pages) سرور ندارد؛ ورک‌فلو Pages این پوشه را پیش از
   build حذف می‌کند وگرنه مسیر پراکسی در export مجاز نیست. */
export const dynamic = "force-dynamic";

const hopByHop = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

async function proxy(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const incoming = new URL(request.url);
  const destination = `${target}/v1/${path.join("/")}${incoming.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!hopByHop.has(key)) headers.set(key, value);
  });

  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  let upstream: Response;
  try {
    upstream = await fetch(destination, {
      method: request.method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });
  } catch {
    return Response.json(
      {
        error: {
          code: "UNAVAILABLE",
          message: "Auth service unreachable",
        },
      },
      { status: 502 },
    );
  }

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (!hopByHop.has(key) && key !== "set-cookie") {
      responseHeaders.set(key, value);
    }
  });

  /* هر کوکی جدا append می‌شود؛ set() آن‌ها را در یک رشته ادغام و خراب می‌کرد. */
  for (const cookie of upstream.headers.getSetCookie()) {
    responseHeaders.append("set-cookie", cookie);
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
}

export {
  proxy as GET,
  proxy as POST,
  proxy as PUT,
  proxy as PATCH,
  proxy as DELETE,
  proxy as HEAD,
  proxy as OPTIONS,
};
