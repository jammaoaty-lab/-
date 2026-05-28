#!/bin/bash

# ==========================================
# 过期数据清理脚本
# 功能：清理过期验证码、临时token等
# ==========================================

PROJECT_DIR="/data/wwwroot/ai_drama_platform"
LOG_DIR="$PROJECT_DIR/logs"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/cleanup_expired.log"
}

log "开始清理过期数据"

# 这里可以调用后端接口或直接执行SQL清理
# 清理过期验证码（示例）
mysql -u root -p123456 ai_drama_platform << EOF
DELETE FROM sms_codes WHERE expire_time < UNIX_TIMESTAMP();
DELETE FROM verify_tokens WHERE expire_time < UNIX_TIMESTAMP();
EOF

log "过期数据清理完成"

