# ---- Build stage: compiles TypeScript to dist/ ----
FROM node:22-alpine AS builder
WORKDIR /app
# bcrypt needs to compile a native addon
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Production dependencies stage: node_modules without devDependencies ----
# --omit=optional drops the one prod optionalDependency in the tree (pg's
# pg-cloudflare, a pure-JS Cloudflare Workers shim never loaded on Cloud Run)
# along with the optional peer chain typeorm -> ts-node -> typescript/@swc,
# none of which the compiled runtime needs (migrations run outside the container).
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache python3 make g++
COPY package.json package-lock.json ./
RUN npm ci --omit=dev --omit=optional && npm cache clean --force

# ---- Runtime stage: no build tools, no devDependencies, no TS source ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./

USER node
EXPOSE 8080
CMD ["node", "dist/main"]
