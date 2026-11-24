import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

/* در حالت استاتیک (GitHub Pages) هیچ بک‌اندی وجود ندارد و auth فقط
   با NEXT_PUBLIC_AUTH_API_URL کار می‌کند. در اجرای سروری، درخواست‌های
   /v1 در توسعه به سرور auth محلی هدایت می‌شوند تا کوکی نشست
   same-origin بماند و در مرورگر CORS لازم نباشد. */
const authDevApi = process.env.AUTH_DEV_API_URL ?? "http://127.0.0.1:8787";

const nextConfig: NextConfig = basePath
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {
      async rewrites() {
        return [
          {
            source: "/v1/:path*",
            destination: `${authDevApi}/v1/:path*`,
          },
        ];
      },
    };

export default nextConfig;
