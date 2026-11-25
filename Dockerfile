# نقشهٔ پشتیبان برای پلتفرم Docker در لیارا.
# در حالت معمول پلتفرم NextJS استفاده می‌شود و این فایل نادیده می‌ماند.
FROM node:24-slim

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

ENV PORT=3000
EXPOSE 3000

CMD ["npm", "run", "start"]
