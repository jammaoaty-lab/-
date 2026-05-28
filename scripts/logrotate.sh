#!/bin/bash

# ==========================================
# 日志切割脚本
# 功能：每周日凌晨2点自动切割各类日志，保留30天
# ==========================================

PROJECT_DIR="/data/wwwroot/ai_drama_platform"
LOG_DIR="$PROJECT_DIR/logs"
BACKUP_DIR="$LOG_DIR/backup"
DATE=$(date +"%Y%m%d")

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 开始执行日志切割"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 定义需要切割的日志列表
LOG_FILES=(
    "$LOG_DIR/nginx_access.log"
    "$LOG_DIR/nginx_error.log"
    "$LOG_DIR/php_error.log"
    "$LOG_DIR/php_slow.log"
    "$LOG_DIR/queue_work.log"
    "$LOG_DIR/ffmpeg_job.log"
    "$LOG_DIR/report_*.log"
)

# 切割日志
for log_file in "${LOG_FILES[@]}"; do
    if [ -f "$log_file" ]; then
        filename=$(basename $log_file)
        backup_file="$BACKUP_DIR/${filename%.*}_$DATE.log"
        
        # 重命名日志文件
        mv $log_file $backup_file
        echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已切割: $filename -> $backup_file"
    fi
done

# 重新加载 Nginx（如果需要）
if [ -f "/var/run/nginx.pid" ]; then
    kill -USR1 $(cat /var/run/nginx.pid)
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Nginx已重新加载"
fi

# 清理30天前的备份
find $BACKUP_DIR -name "*.log" -mtime +30 -delete
echo "[$(date '+%Y-%m-%d %H:%M:%S')] 已清理30天前的日志备份"

echo "[$(date '+%Y-%m-%d %H:%M:%S')] 日志切割完成"

