# 前端 Next.js Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# 复制依赖文件
COPY package.json package-lock.json* ./
COPY apps/web/package.json ./apps/web/
COPY packages/shared/package.json ./packages/shared/

# 安装依赖
RUN npm install

# 复制源代码
COPY apps/web/ ./apps/web/
COPY packages/shared/ ./packages/shared/

# 构建
RUN npm run build:shared && npm run build:web -w apps/web

# 运行阶段
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/apps/web/.next/standalone ./
COPY --from=builder /app/apps/web/.next/static ./.next/static
COPY --from=builder /app/apps/web/public ./public

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]