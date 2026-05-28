#!/bin/bash

# ==========================================
# 队列进程监控脚本
# 功能：检查队列进程是否运行，异常自动重启
# ==========================================

PROJECT_DIR="/data/wwwroot/ai_drama_platform"
BACKEND_DIR="$PROJECT_DIR/web_main"
LOG_DIR="$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/monitor_queue.log"
}

log "开始检查队列进程"

# 检查 ThinkPHP 队列进程数量
QUEUE_COUNT=$(ps aux | grep "think queue:listen" | grep -v grep | wc -l)

if [ "$QUEUE_COUNT" -eq 0 ]; then
    log "队列进程未运行，尝试重启"
    
    cd $BACKEND_DIR
    nohup php think queue:listen --tries=3 > $LOG_DIR/queue_work.log 2>&1 &
    echo $! > $LOG_DIR/queue.pid
    
    log "队列进程已重启，PID: $(cat $LOG_DIR/queue.pid)"
else
    log "队列进程运行正常，数量: $QUEUE_COUNT"
fi

# 检查 FFmpeg 相关进程
FFMPEG_COUNT=$(ps aux | grep "ffmpeg" | grep -v grep | wc -l)
log "FFmpeg 进程数: $FFMPEG_COUNT"

