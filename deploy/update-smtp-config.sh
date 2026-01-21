#!/bin/bash

###############################################
# 更新服务器上的 SMTP 配置
# 从 config.prod.sh 读取配置并更新服务器上的 .env 文件
###############################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检查配置文件
CONFIG_FILE="$(dirname "$0")/config.prod.sh"
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "配置文件不存在: $CONFIG_FILE"
    exit 1
fi

source "$CONFIG_FILE"

# 检查必需的配置
if [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ] || [ -z "$SERVER_PATH" ]; then
    print_error "配置不完整，请检查 config.prod.sh 文件"
    exit 1
fi

print_info "开始更新服务器上的 SMTP 配置..."
print_info "服务器: ${SERVER_USER}@${SERVER_HOST}"
print_info "后端路径: ${SERVER_PATH}/backend"

# 更新服务器上的 .env 文件
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    set -e
    
    cd ${SERVER_PATH}/backend
    
    if [ ! -f .env ]; then
        echo "错误: .env 文件不存在"
        exit 1
    fi
    
    echo "备份当前 .env 文件..."
    cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
    
    echo "更新 SMTP 配置..."
    
    # 删除旧的 SMTP 配置
    sed -i '/^SMTP_HOST=/d' .env
    sed -i '/^SMTP_PORT=/d' .env
    sed -i '/^SMTP_USER=/d' .env
    sed -i '/^SMTP_PASS=/d' .env
    sed -i '/^# SMTP配置/d' .env
    
    # 添加新的 SMTP 配置
    if [ -n "$SMTP_HOST" ]; then
        echo "" >> .env
        echo "# SMTP配置" >> .env
        echo "SMTP_HOST=${SMTP_HOST}" >> .env
        echo "SMTP_PORT=${SMTP_PORT}" >> .env
        echo "SMTP_USER=${SMTP_USER}" >> .env
        echo "SMTP_PASS=${SMTP_PASS}" >> .env
        echo "SMTP 配置已更新"
    else
        echo "警告: SMTP_HOST 未配置，跳过 SMTP 配置更新"
    fi
    
    echo ""
    echo "当前 SMTP 配置:"
    grep -E "^SMTP_" .env || echo "未找到 SMTP 配置"
ENDSSH

print_info "✅ SMTP 配置更新完成！"
print_info "正在重启后端服务以应用新配置..."

# 重启服务
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH}/backend && pm2 restart ${PM2_APP_NAME}"

print_info "✅ 服务已重启"
print_info ""
print_info "📝 下一步："
print_info "   1. 在服务器上运行诊断脚本验证配置:"
print_info "      ssh ${SERVER_USER}@${SERVER_HOST}"
print_info "      cd ${SERVER_PATH}/backend"
print_info "      node diagnose-smtp.js"
print_info ""
print_info "   2. 或者测试忘记密码功能:"
print_info "      https://gjson.com/forgot-password"
