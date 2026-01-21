#!/bin/bash

###############################################
# AI工具集 - 一键部署脚本
# 目标服务器: 阿里云ECS
# 域名: gjson.com
###############################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数：打印信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_step() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 加载配置文件
CONFIG_FILE="$(dirname "$0")/config.prod.sh"
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
    print_info "已加载配置文件: $CONFIG_FILE"
else
    print_error "配置文件不存在: $CONFIG_FILE"
    print_error "请先创建配置文件："
    echo ""
    echo "  方法1: 使用配置向导（推荐）"
    echo "    cd $(dirname "$0")"
    echo "    ./setup-deploy.sh"
    echo ""
    echo "  方法2: 手动创建"
    echo "    cp $(dirname "$0")/config.example.sh $(dirname "$0")/config.prod.sh"
    echo "    vim $(dirname "$0")/config.prod.sh"
    echo ""
    exit 1
fi

# 验证必需的配置
if [ -z "$SERVER_USER" ] || [ -z "$SERVER_HOST" ] || [ -z "$DB_PASSWORD" ]; then
    print_error "配置不完整，请检查 config.prod.sh 文件中的以下变量："
    echo "  - SERVER_USER"
    echo "  - SERVER_HOST"
    echo "  - DB_PASSWORD"
    exit 1
fi

# 主程序开始
clear
echo -e "${GREEN}"
echo "╔════════════════════════════════════════════╗"
echo "║      AI工具集 - 一键部署脚本                ║"
echo "║      目标: ${DOMAIN}                        ║"
echo "╚════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Step 1: 检查本地环境
print_step "Step 1: 检查本地环境"

if ! command_exists node; then
    print_error "Node.js 未安装，请先安装 Node.js"
    exit 1
fi
print_info "✓ Node.js 版本: $(node --version)"

if ! command_exists npm; then
    print_error "npm 未安装"
    exit 1
fi
print_info "✓ npm 版本: $(npm --version)"

# Step 2: 构建项目
print_step "Step 2: 构建前后端项目"

# 构建前端
print_info "正在构建前端..."
cd "$(dirname "$0")/.."
if [ ! -f "package.json" ]; then
    print_error "前端 package.json 不存在"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    print_info "安装前端依赖..."
    npm install
fi
print_info "构建前端代码..."
npm run build
print_info "✓ 前端构建完成"

# 构建后端（不需要构建，直接上传源码）
print_info "检查后端代码..."
if [ ! -d "backend" ]; then
    print_error "后端目录不存在"
    exit 1
fi
print_info "✓ 后端代码检查完成"

# Step 3: 创建部署包
print_step "Step 3: 创建部署包"

DEPLOY_DIR="deploy_package"
rm -rf $DEPLOY_DIR
mkdir -p $DEPLOY_DIR

# 复制前端构建文件
print_info "打包前端文件..."
mkdir -p $DEPLOY_DIR/frontend
cp -r dist/* $DEPLOY_DIR/frontend/

# 复制后端文件（排除不需要的文件）
print_info "打包后端文件..."
mkdir -p $DEPLOY_DIR/backend
rsync -av --exclude 'node_modules' \
    --exclude '.env' \
    --exclude '.git' \
    --exclude '*.log' \
    --exclude 'uploads' \
    backend/ $DEPLOY_DIR/backend/

print_info "✓ 部署包创建完成"

# Step 4: 测试SSH连接
print_step "Step 4: 测试SSH连接"
print_info "测试连接到 ${SERVER_USER}@${SERVER_HOST}..."

if ssh -o ConnectTimeout=5 ${SERVER_USER}@${SERVER_HOST} "echo 'SSH连接成功'" 2>/dev/null; then
    print_info "✓ SSH连接正常"
else
    print_error "无法连接到服务器，请检查："
    echo "  1. SSH密钥是否已配置"
    echo "  2. 服务器地址是否正确"
    echo "  3. 网络连接是否正常"
    echo ""
    echo "尝试手动连接: ssh ${SERVER_USER}@${SERVER_HOST}"
    exit 1
fi

# Step 5: 上传文件到服务器
print_step "Step 5: 上传文件到服务器"

print_info "创建服务器目录..."
ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${SERVER_PATH}/backend ${FRONTEND_PATH}"

print_info "上传前端文件..."
rsync -avz --progress $DEPLOY_DIR/frontend/ ${SERVER_USER}@${SERVER_HOST}:${FRONTEND_PATH}/

print_info "上传后端文件..."
rsync -avz --progress $DEPLOY_DIR/backend/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/

print_info "✓ 文件上传完成"

# Step 6: 服务器端部署
print_step "Step 6: 服务器端部署"

ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    set -e
    
    echo "========================================"
    echo "开始服务器端部署"
    echo "========================================"
    
    cd ${SERVER_PATH}/backend
    
    # 创建数据库（如果不存在）
    echo "[INFO] 初始化数据库..."
    mysql -u${DB_USER} -p${DB_PASSWORD} << EOF
CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ${DB_NAME};
SELECT 'Database ${DB_NAME} is ready' AS status;
EOF
    
    # 安装后端依赖
    echo "[INFO] 安装生产依赖..."
    npm install --production
    
    # 检查PM2是否安装
    if ! command -v pm2 &> /dev/null; then
        echo "[INFO] 安装 PM2..."
        npm install -g pm2
    fi
    
    # 创建.env文件
    echo "[INFO] 创建.env文件..."
    cat > .env << EOFENV
NODE_ENV=production
PORT=${BACKEND_PORT}
HOST=0.0.0.0

# 数据库配置
DB_HOST=${DB_HOST}
DB_PORT=${DB_PORT}
DB_USER=${DB_USER}
DB_PASSWORD=${DB_PASSWORD}
DB_NAME=${DB_NAME}

# JWT配置
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRE=7d

# 限流配置
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 前端地址
FRONTEND_URL=https://${DOMAIN}
EOFENV

    # 添加邮件配置（如果提供）
    if [ -n "$SMTP_HOST" ]; then
        cat >> .env << EOFENV

# SMTP配置
SMTP_HOST=${SMTP_HOST}
SMTP_PORT=${SMTP_PORT}
SMTP_USER=${SMTP_USER}
SMTP_PASS=${SMTP_PASS}
EOFENV
    fi
    
    # 停止旧服务（如果存在）
    echo "[INFO] 停止旧服务..."
    pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
    pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
    
    # 检查并清理占用端口的进程（兼容多种方法）
    echo "[INFO] 检查端口${BACKEND_PORT}占用情况..."
    # 方法1: 使用lsof（如果可用）
    PORT_PID=\$(lsof -ti:${BACKEND_PORT} 2>/dev/null || echo "")
    if [ -n "\$PORT_PID" ]; then
        echo "[INFO] 发现端口${BACKEND_PORT}被进程 \$PORT_PID 占用（lsof），正在终止..."
        kill -9 \$PORT_PID 2>/dev/null || true
    fi
    # 方法2: 使用fuser（如果可用）
    fuser -k ${BACKEND_PORT}/tcp 2>/dev/null && echo "[INFO] 使用fuser清理端口${BACKEND_PORT}" || true
    # 方法3: 使用netstat查找并杀死进程
    NETSTAT_PID=\$(netstat -tlnp 2>/dev/null | grep :${BACKEND_PORT} | awk '{print \$7}' | cut -d'/' -f1 | head -1)
    if [ -n "\$NETSTAT_PID" ] && [ "\$NETSTAT_PID" != "-" ]; then
        echo "[INFO] 发现端口${BACKEND_PORT}被进程 \$NETSTAT_PID 占用（netstat），正在终止..."
        kill -9 \$NETSTAT_PID 2>/dev/null || true
    fi
    # 方法4: 使用ss查找并杀死进程
    SS_PID=\$(ss -tlnp 2>/dev/null | grep :${BACKEND_PORT} | grep -oP 'pid=\\K[0-9]+' | head -1)
    if [ -n "\$SS_PID" ]; then
        echo "[INFO] 发现端口${BACKEND_PORT}被进程 \$SS_PID 占用（ss），正在终止..."
        kill -9 \$SS_PID 2>/dev/null || true
    fi
    
    # 等待端口释放
    echo "[INFO] 等待端口释放..."
    sleep 3
    
    # 启动新服务
    echo "[INFO] 启动服务..."
    if [ -f ecosystem.config.js ]; then
        pm2 start ecosystem.config.js
    else
        pm2 start src/app.js --name "${PM2_APP_NAME}" --env production
    fi
    pm2 save
    
    # 配置开机自启
    pm2 startup systemd -u ${SERVER_USER} --hp /home/${SERVER_USER} 2>/dev/null || true
    
    echo "========================================"
    echo "服务器端部署完成！"
    echo "========================================"
ENDSSH

# Step 7: 验证部署
print_step "Step 7: 验证部署"

print_info "等待服务启动..."
sleep 3

print_info "检查后端服务状态..."
if ssh ${SERVER_USER}@${SERVER_HOST} "pm2 list | grep ${PM2_APP_NAME}" 2>/dev/null; then
    print_info "✓ 后端服务运行正常"
else
    print_warning "后端服务可能未正常启动，请检查日志"
fi

print_info "检查端口监听..."
if ssh ${SERVER_USER}@${SERVER_HOST} "netstat -tlnp 2>/dev/null | grep :${BACKEND_PORT} || ss -tlnp 2>/dev/null | grep :${BACKEND_PORT}" 2>/dev/null; then
    print_info "✓ 端口${BACKEND_PORT}正在监听"
else
    print_warning "端口${BACKEND_PORT}未监听，服务可能启动失败"
fi

# Step 8: 清理临时文件
print_step "Step 8: 清理临时文件"
rm -rf $DEPLOY_DIR
print_info "✓ 临时文件已清理"

# 部署完成
print_step "🎉 部署完成！"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}       部署成功！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📱 访问地址:"
echo "   前端: https://${DOMAIN}"
echo "   后端API: https://${DOMAIN}/api"
echo "   夜校API: https://${DOMAIN}/app/api"
echo ""
echo "🔧 管理命令:"
echo "   查看服务状态: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 status'"
echo "   查看日志: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 logs ${PM2_APP_NAME}'"
echo "   重启服务: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 restart ${PM2_APP_NAME}'"
echo "   停止服务: ssh ${SERVER_USER}@${SERVER_HOST} 'pm2 stop ${PM2_APP_NAME}'"
echo ""
echo "📚 下一步:"
echo "   1. 访问 https://${DOMAIN} 测试应用"
echo "   2. 检查API是否正常工作"
echo "   3. 查看日志确认无错误"
echo ""
echo -e "${YELLOW}⚠️  注意事项:${NC}"
echo "   - 首次访问可能需要等待几秒钟"
echo "   - 如遇问题，请查看PM2日志"
echo "   - Nginx配置需要单独更新（使用部署工具菜单选项8）"
echo ""
echo -e "${GREEN}部署脚本执行完毕！${NC}"
echo ""

