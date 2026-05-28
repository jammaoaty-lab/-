#!/bin/bash

# ==========================================
# 临时文件清理脚本
# 功能：定期清理FFmpeg临时文件、队列临时文件等
# ==========================================

PROJECT_DIR="/data/wwwroot/ai_drama_platform"
LOG_DIR="$PROJECT_DIR/logs"
TEMP_DIRS=(
    "$PROJECT_DIR/web_main/runtime/temp"
    "$PROJECT_DIR/ffmpeg_service/temp"
    "/tmp/ai_drama_ffmpeg"
)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/cron_cleanup.log"
}

log "开始清理临时文件"

for temp_dir in "${TEMP_DIRS[@]}"; do
    if [ -d "$temp_dir" ]; then
        # 清理1小时前的临时文件
        find "$temp_dir" -type f -mmin +60 -delete
        log "已清理目录: $temp_dir"
        
        # 清理空目录
        find "$temp_dir" -type d -empty -delete
    fi
done

log "临时文件清理完成"

