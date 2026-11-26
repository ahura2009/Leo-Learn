import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH;

/* در حالت استاتیک (GitHub Pages) هیچ بک‌اندی وجود ندارد و auth فقط
   با NEXT_PUBLIC_AUTH_API_URL کار می‌کند. در اجرای سروری، درخواست‌های
   /v1 را Route Handler داخل app/v1/[...path] به سرور auth پراکسی می‌کند
   تا کوکی نشست same-origin بماند و در مرورگر CORS لازم نباشد. */
const nextConfig: NextConfig = basePath
  ? {
      output: "export",
      basePath,
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
