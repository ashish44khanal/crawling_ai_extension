FROM node:20-alpine AS builder
RUN apk update
# Set working directory
WORKDIR /app
RUN npm install -g pnpm && npm add -g turbo
COPY . .
RUN turbo prune server --docker

# Add lockfile and package.json's of isolated subworkspace
FROM node:20-alpine AS installer
RUN apk update && npm install -g pnpm 
WORKDIR /app

COPY --from=builder /app/out/json/ .
COPY --from=builder /app/turbo.json ./turbo.json
RUN pnpm install


FROM node:20-alpine AS sourcer
WORKDIR /app 
RUN npm install -g pnpm && npm add -g turbo

COPY --from=installer /app/ .
COPY --from=builder /app/out/full/ .
COPY .gitignore .gitignore
RUN pnpm run build

FROM node:20-alpine as runner
WORKDIR /app
COPY --from=sourcer /app/ .
CMD [ "node", "apps/server/dist/main.js" ]