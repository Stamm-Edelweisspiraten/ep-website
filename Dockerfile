# Stammeswebsite (SvelteKit, adapter-node) – eigenständiger Dienst neben dem Intern-Bereich.
# Bauen im Ordner website/:  docker build -t ep-website .
# Gleiche Basis wie das App-Image (../Dockerfile): feste Version + Digest, Updates per Dependabot (Issue #74).
FROM node:24.22.0-bookworm-slim@sha256:a5f4366e834695d5f363b920c104953a535d3a9864d1bdf74566a0ebe01daee5 AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Keine Install-Skripte aus Abhängigkeiten ausführen; `svelte-kit sync` (sonst `prepare`) läuft explizit im Build
RUN npm ci --ignore-scripts

FROM deps AS build
WORKDIR /app
COPY . .
RUN npx svelte-kit sync && npm run build && npm prune --omit=dev

FROM base AS runtime
ENV NODE_ENV=production \
	PORT=3001 \
	HOST=0.0.0.0
WORKDIR /app
COPY --from=build --chown=node:node /app/build ./build
COPY --from=build --chown=node:node /app/node_modules ./node_modules
COPY --from=build --chown=node:node /app/package.json ./package.json
USER node
EXPOSE 3001
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3001)+'/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
STOPSIGNAL SIGTERM
CMD ["node", "build"]
