# Target architecture for the produced image.
# Defaults to linux/amd64 (standard x86_64 Linux servers) so a plain
# `docker build` on an Apple Silicon / ARM machine still yields an image that
# runs on amd64 hosts. Override for ARM with `--build-arg IMAGE_PLATFORM=linux/arm64`.
# (A custom arg name is used on purpose — the reserved TARGETPLATFORM is
# auto-set to the host platform and would ignore this default.)
ARG IMAGE_PLATFORM=linux/amd64

# ── Stage 1: Install dependencies ──
FROM --platform=${IMAGE_PLATFORM} node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# ── Stage 2: Build ──
FROM --platform=${IMAGE_PLATFORM} node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* vars must be present at build time
ARG NEXT_PUBLIC_WHATSAPP_NUMBER=966568406006
ARG NEXT_PUBLIC_SITE_URL=https://falcon-it.sa
ENV NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── Stage 3: Production image ──
FROM --platform=${IMAGE_PLATFORM} node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Data directory for settings, leads, content (persist via Docker volume)
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
VOLUME /app/data

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
