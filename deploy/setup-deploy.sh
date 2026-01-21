#!/bin/bash

###############################################
# AI工具集 - 部署配置向导
# 帮助你创建安全的配置文件
###############################################

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║      AI工具集 - 部署配置向导                ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

CONFIG_FILE="$(dirname "$0")/config.prod.sh"

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}配置文件已存在: $CONFIG_FILE${NC}"
    read -p "是否覆盖? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "已取消"
        exit 0
    fi
fi

echo "请输入以下配置信息："
echo ""

read -p "服务器SSH用户名 (默认: gjson): " SERVER_USER
SERVER_USER=${SERVER_USER:-"gjson"}

read -p "服务器IP地址 (默认: 47.95.118.57): " SERVER_HOST
SERVER_HOST=${SERVER_HOST:-"47.95.118.57"}

read -p "服务器部署路径 (默认: /opt/ai-tools-backend): " SERVER_PATH
SERVER_PATH=${SERVER_PATH:-"/opt/ai-tools-backend"}

read -p "域名 (默认: gjson.com): " DOMAIN
DOMAIN=${DOMAIN:-"gjson.com"}

read -p "后端端口 (默认: 3001): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-"3001"}

read -p "PM2应用名称 (默认: ai-tools-backend): " PM2_APP_NAME
PM2_APP_NAME=${PM2_APP_NAME:-"ai-tools-backend"}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "数据库配置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "数据库主机 (默认: localhost): " DB_HOST
DB_HOST=${DB_HOST:-"localhost"}

read -p "数据库端口 (默认: 3306): " DB_PORT
DB_PORT=${DB_PORT:-"3306"}

read -p "数据库名 (默认: ai_tools): " DB_NAME
DB_NAME=${DB_NAME:-"ai_tools"}

read -p "数据库用户名: " DB_USER
read -sp "数据库密码: " DB_PASSWORD
echo ""

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "JWT配置："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "提示: 可以使用 'openssl rand -base64 32' 生成随机密钥"
read -p "JWT密钥 (留空自动生成): " JWT_SECRET
if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET=$(openssl rand -base64 32)
    echo "已自动生成JWT密钥"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "前端部署路径："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "前端部署路径 (默认: /var/www/ai-tools): " FRONTEND_PATH
FRONTEND_PATH=${FRONTEND_PATH:-"/var/www/ai-tools"}

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "邮件配置（可选）："
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
read -p "SMTP主机 (留空跳过): " SMTP_HOST
if [ -n "$SMTP_HOST" ]; then
    read -p "SMTP端口 (默认: 587): " SMTP_PORT
    SMTP_PORT=${SMTP_PORT:-"587"}
    read -p "SMTP用户名: " SMTP_USER
    read -sp "SMTP密码: " SMTP_PASS
    echo ""
fi

# 生成配置文件
cat > "$CONFIG_FILE" << EOF
#!/bin/bash

###############################################
# AI工具集 - 生产环境配置文件
# 创建时间: $(date)
# ⚠️  此文件包含敏感信息，不要提交到Git！
###############################################

# 服务器配置
export SERVER_USER="$SERVER_USER"
export SERVER_HOST="$SERVER_HOST"
export SERVER_PATH="$SERVER_PATH"
export DOMAIN="$DOMAIN"

# 后端配置
export BACKEND_PORT="$BACKEND_PORT"
export PM2_APP_NAME="$PM2_APP_NAME"

# 数据库配置
export DB_HOST="$DB_HOST"
export DB_PORT="$DB_PORT"
export DB_NAME="$DB_NAME"
export DB_USER="$DB_USER"
export DB_PASSWORD="$DB_PASSWORD"

# JWT配置
export JWT_SECRET="$JWT_SECRET"

# 前端部署路径
export FRONTEND_PATH="$FRONTEND_PATH"
EOF

# 添加邮件配置（如果提供）
if [ -n "$SMTP_HOST" ]; then
    cat >> "$CONFIG_FILE" << EOF

# 邮件配置
export SMTP_HOST="$SMTP_HOST"
export SMTP_PORT="$SMTP_PORT"
export SMTP_USER="$SMTP_USER"
export SMTP_PASS="$SMTP_PASS"
EOF
fi

chmod 600 "$CONFIG_FILE"

echo ""
echo -e "${GREEN}✓ 配置文件已创建: $CONFIG_FILE${NC}"
echo ""
echo "接下来："
echo "1. 查看配置文件: cat $CONFIG_FILE"
echo "2. 运行部署脚本: ./deploy.sh"
echo ""
echo -e "${YELLOW}⚠️  提醒: 此文件已被.gitignore忽略，不会提交到Git${NC}"

