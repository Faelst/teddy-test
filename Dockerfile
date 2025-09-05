ARG NODE_VERSION=20.14.0

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
RUN apk add --no-cache bash openssl tzdata curl
ENV TZ=UTC

FROM base AS deps
COPY package*.json ./
RUN npm ci

FROM deps AS build
COPY tsconfig*.json ./
COPY prisma ./prisma
RUN npx prisma generate
COPY src ./src
RUN npm run build

FROM base AS prod-deps
COPY package*.json ./
RUN npm ci --omit=dev

COPY .env.example ./.env.example
RUN [ -f .env.local ] || cp .env.example .env.local

FROM base AS local
ENV NODE_ENV=development
COPY --from=deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY prisma ./prisma
COPY /entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
EXPOSE 3000
CMD ["/entrypoint.sh"]

