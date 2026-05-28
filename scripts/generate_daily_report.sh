#!/bin/bash

# ==========================================
# 后台定时报表生成脚本
# 功能：每日凌晨1点自动生成前一天的数据报表
# ==========================================

PROJECT_DIR="/data/wwwroot/ai_drama_platform"
BACKEND_DIR="$PROJECT_DIR/web_main"
REPORT_DIR="$PROJECT_DIR/reports"
LOG_DIR="$PROJECT_DIR/logs"
DATE=$(date -d "yesterday" +"%Y-%m-%d")
YESTERDAY_DATE=$(date -d "yesterday" +"%Y%m%d")

# 日志记录函数
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_DIR/report_$(date +%Y%m%d).log"
}

log "开始生成日报: $DATE"

# 创建目录
mkdir -p $REPORT_DIR
mkdir -p $LOG_DIR

# 生成用户数据报表
log "生成用户数据报表"
cat << EOF > $REPORT_DIR/user_report_$YESTERDAY_DATE.csv
report_date,new_users,normal_users,creator_users,vip_users,enterprise_users,active_users
${DATE},$(mysql -u root -p123456 -sN -D ai_drama_platform << SQL
SELECT CONCAT(
    COUNT(*), ',',
    SUM(CASE WHEN user_type = 1 THEN 1 ELSE 0 END), ',',
    SUM(CASE WHEN user_type = 2 THEN 1 ELSE 0 END), ',',
    SUM(CASE WHEN user_type = 3 THEN 1 ELSE 0 END), ',',
    SUM(CASE WHEN user_type = 4 THEN 1 ELSE 0 END)
) FROM users WHERE DATE(register_time) = '$DATE'
SQL
)
EOF

log "报表生成完成！"

