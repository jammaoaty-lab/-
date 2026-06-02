# 后端 FastAPI Dockerfile
FROM python:3.12-slim

WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential libpq-dev && \
    rm -rf /var/lib/apt/lists/*

# 安装 Python 依赖
COPY apps/server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY apps/server/ ./apps/server/
COPY packages/shared/ ./packages/shared/

WORKDIR /app/apps/server

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]