# Tape 01 — production image. A self-contained Next.js server (output: "standalone").
# Editable content lives on a persistent disk at /data (CONTENT_DIR): mount one there.
#   docker build -t swarnava .
#   docker run -p 3000:3000 -v swarnava-data:/data --env-file .env.production swarnava

FROM node:24-bookworm-slim AS base
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Dependencies (Linux builds of sharp etc.), cached until the lockfile changes.
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Build: the hero plate and placeholders from _assets-src, then the Next build.
FROM base AS build
ARG NEXT_PUBLIC_SITE_URL=https://swarnava.xyz
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run prep:assets && npm run build

# Runtime: just the server, its static files, and the content seed.
FROM base AS run
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    CONTENT_DIR=/data
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
COPY --from=build --chown=node:node /app/content/data ./content/data
COPY --chmod=755 scripts/docker-start.sh /usr/local/bin/docker-start
RUN mkdir -p /data && chown node:node /data
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s CMD node -e "fetch('http://127.0.0.1:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["docker-start"]
