#!/bin/bash

###############################################
# AI工具集 - 统一部署工具
# 支持：初次部署、更新部署、快速重启
###############################################

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 打印函数
print_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }
print_step() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

# 上传前端文件到服务器
upload_frontend() {
    local target_path=$1
    print_info "上传前端..."
    ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${target_path} 2>/dev/null || true"
    rsync -avz --progress dist/* ${SERVER_USER}@${SERVER_HOST}:${target_path}/
}

# 检查配置文件
CONFIG_FILE="deploy/config.prod.sh"
if [ ! -f "$CONFIG_FILE" ]; then
    print_error "配置文件不存在: $CONFIG_FILE"
    print_info "请先运行: cd deploy && ./setup-deploy.sh"
    exit 1
fi

source "$CONFIG_FILE"

# 显示菜单
show_menu() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
╔════════════════════════════════════════════════════════╗
║         AI工具集 - 统一部署工具                         ║
╚════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    echo "请选择操作："
    echo ""
    echo "  1) 完整部署 (首次部署或完全重新部署)"
    echo "  2) 快速更新 (只更新代码，不重建环境)"
    echo "  3) 仅更新前端"
    echo "  4) 仅更新后端"
    echo "  5) 重启服务"
    echo "  6) 查看服务状态"
    echo "  7) 查看日志"
    echo "  8) 更新 Nginx 配置"
    echo "  9) YXH5部署 (夜校H5项目)"
    echo "  0) 退出"
    echo ""
    echo -n "请输入选项 [0-9]: "
}

# 1. 完整部署
full_deploy() {
    print_step "开始完整部署"
    
    # 使用 deploy/one-click-deploy.sh
    if [ -f "deploy/one-click-deploy.sh" ]; then
        chmod +x deploy/one-click-deploy.sh
        ./deploy/one-click-deploy.sh
    else
        print_error "部署脚本不存在"
        exit 1
    fi
}

# 2. 快速更新
quick_update() {
    print_step "快速更新代码"
    
    # 构建前端
    print_info "构建前端..."
    if [ -f "package.json" ]; then
        npm run build
    else
        print_error "前端 package.json 不存在"
        exit 1
    fi
    
    # 上传前端
    upload_frontend "${FRONTEND_PATH}"
    
    # 上传后端
    print_info "上传后端..."
    rsync -avz --progress --exclude 'node_modules' --exclude '.env' backend/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/
    
    # 重启后端
    print_info "重启后端服务..."
    ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH}/backend && pm2 restart ${PM2_APP_NAME}"
    
    print_step "✅ 快速更新完成！"
    echo ""
    echo "访问地址: https://${DOMAIN}"
}

# 3. 仅更新前端
update_frontend() {
    print_step "更新前端"
    
    print_info "构建前端..."
    npm run build
    
    upload_frontend "${FRONTEND_PATH}"
    
    print_step "✅ 前端更新完成！"
}

# 4. 仅更新后端
update_backend() {
    print_step "更新后端"
    
    print_info "上传后端代码..."
    rsync -avz --progress \
        --exclude 'node_modules' \
        --exclude '.env' \
        --exclude '.git' \
        --exclude '*.log' \
        --exclude 'uploads' \
        backend/ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/backend/
    
    print_info "在服务器上安装依赖并重启服务..."
    ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
        cd ${SERVER_PATH}/backend
        
        # 安装生产依赖
        echo "[INFO] 安装生产依赖..."
        npm install --production
        
        # 更新 .env 文件中的 SMTP 配置（如果配置了）
        if [ -n "$SMTP_HOST" ]; then
            echo "[INFO] 更新 SMTP 配置..."
            # 备份 .env 文件
            if [ -f .env ]; then
                cp .env .env.backup.\$(date +%Y%m%d_%H%M%S)
            fi
            
            # 删除旧的 SMTP 配置
            sed -i '/^SMTP_HOST=/d' .env 2>/dev/null || true
            sed -i '/^SMTP_PORT=/d' .env 2>/dev/null || true
            sed -i '/^SMTP_USER=/d' .env 2>/dev/null || true
            sed -i '/^SMTP_PASS=/d' .env 2>/dev/null || true
            sed -i '/^# SMTP配置/d' .env 2>/dev/null || true
            
            # 添加新的 SMTP 配置
            echo "" >> .env
            echo "# SMTP配置" >> .env
            echo "SMTP_HOST=${SMTP_HOST}" >> .env
            echo "SMTP_PORT=${SMTP_PORT}" >> .env
            echo "SMTP_USER=${SMTP_USER}" >> .env
            echo "SMTP_PASS=${SMTP_PASS}" >> .env
            echo "[INFO] SMTP 配置已更新"
        fi
        
        # 完全重启PM2服务（确保加载新代码）
        echo "[INFO] 停止并删除旧服务..."
        pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
        pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
        
        # 检查并清理占用端口的进程
        echo "[INFO] 检查端口${BACKEND_PORT}占用情况..."
        PORT_PID=""
        # 优先使用 lsof，如果不可用则使用 ss
        if command -v lsof >/dev/null 2>&1; then
            PORT_PID=\$(lsof -ti:${BACKEND_PORT} 2>/dev/null || echo "")
        elif command -v ss >/dev/null 2>&1; then
            PORT_PID=\$(ss -tlnp 2>/dev/null | grep :${BACKEND_PORT} | grep -oP 'pid=\\K[0-9]+' | head -1)
        fi
        
        if [ -n "\$PORT_PID" ]; then
            echo "[INFO] 发现端口${BACKEND_PORT}被进程 \$PORT_PID 占用，正在终止..."
            kill -9 \$PORT_PID 2>/dev/null || true
        fi
        
        # 等待端口释放
        echo "[INFO] 等待端口释放..."
        sleep 3
        
        echo "[INFO] 启动新服务..."
        if [ -f ecosystem.config.js ]; then
            pm2 start ecosystem.config.js
        else
            pm2 start src/app.js --name "${PM2_APP_NAME}" --env production
        fi
        
        # 等待服务启动
        sleep 3
        
        # 验证服务是否正常
        echo "[INFO] 验证服务..."
        if curl -f -s http://localhost:${BACKEND_PORT}/health > /dev/null 2>&1; then
            echo "[INFO] 服务健康检查通过"
        else
            echo "[WARNING] 服务健康检查失败，请查看日志"
        fi
        
        # 保存PM2配置
        pm2 save
        
        # 显示服务状态
        echo "[INFO] 服务状态:"
        pm2 status | grep ${PM2_APP_NAME} || pm2 list
ENDSSH
    
    print_step "✅ 后端更新完成！"
    echo ""
    echo "📊 验证部署："
    echo "  访问: https://${DOMAIN}/app/api/courses"
    echo "  应该返回课程列表而不是404错误"
}

# 5. 重启服务
restart_services() {
    print_step "重启服务"
    
    print_info "重启后端..."
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 restart ${PM2_APP_NAME}"
    
    print_info "重启 Nginx..."
    ssh ${SERVER_USER}@${SERVER_HOST} "sudo systemctl reload nginx"
    
    print_step "✅ 服务重启完成！"
}

# 6. 查看服务状态
check_status() {
    print_step "查看服务状态"
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "PM2 服务状态："
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ssh ${SERVER_USER}@${SERVER_HOST} "pm2 status"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Nginx 状态："
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ssh ${SERVER_USER}@${SERVER_HOST} "sudo systemctl status nginx | head -15"
    
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "端口监听："
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    ssh ${SERVER_USER}@${SERVER_HOST} "netstat -tlnp 2>/dev/null | grep :${BACKEND_PORT} || ss -tlnp 2>/dev/null | grep :${BACKEND_PORT}"
}

# 7. 查看日志
view_logs() {
    print_step "查看日志"
    
    echo "请选择要查看的日志："
    echo ""
    echo "  1) PM2 后端日志"
    echo "  2) Nginx 访问日志"
    echo "  3) Nginx 错误日志"
    echo "  0) 返回主菜单"
    echo ""
    echo -n "请输入选项 [0-3]: "
    read log_choice
    
    case $log_choice in
        1)
            ssh ${SERVER_USER}@${SERVER_HOST} "pm2 logs ${PM2_APP_NAME} --lines 50"
            ;;
        2)
            ssh ${SERVER_USER}@${SERVER_HOST} "sudo tail -50 /var/log/nginx/access.log"
            ;;
        3)
            ssh ${SERVER_USER}@${SERVER_HOST} "sudo tail -50 /var/log/nginx/error.log"
            ;;
        0)
            return
            ;;
        *)
            print_error "无效的选项"
            ;;
    esac
}

# 8. 更新 Nginx 配置
update_nginx() {
    print_step "更新 Nginx 配置"
    
    # 获取配置文件绝对路径
    NGINX_CONF_PATH="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/nginx-gjson.conf"
    if [ ! -f "$NGINX_CONF_PATH" ]; then
        print_error "Nginx 配置文件不存在: $NGINX_CONF_PATH"
        exit 1
    fi
    
    print_info "上传 Nginx 配置..."
    scp "$NGINX_CONF_PATH" ${SERVER_USER}@${SERVER_HOST}:/tmp/nginx-gjson.conf
    
    print_info "部署 Nginx 配置..."
    # 检查服务器使用的是 sites-available 还是 conf.d 方式
    ssh -t ${SERVER_USER}@${SERVER_HOST} "
        if [ -d \"/etc/nginx/sites-available\" ]; then
            echo '[INFO] 使用 sites-available 方式部署...'
            sudo cp /tmp/nginx-gjson.conf /etc/nginx/sites-available/gjson.com && \
            sudo ln -sf /etc/nginx/sites-available/gjson.com /etc/nginx/sites-enabled/gjson.com && \
            sudo nginx -t && \
            sudo systemctl reload nginx
        else
            echo '[INFO] 使用 conf.d 方式部署...'
            sudo cp /tmp/nginx-gjson.conf /etc/nginx/conf.d/gjson.conf && \
            sudo nginx -t && \
            sudo systemctl reload nginx
        fi
    "
    
    if [ $? -eq 0 ]; then
        print_step "✅ Nginx 配置更新完成！"
    else
        print_error "Nginx 配置更新失败"
        exit 1
    fi
}

# 9. YXH5部署
deploy_yxh5() {
    print_step "部署夜校H5项目 (YXH5)"
    
    # 获取脚本所在目录的绝对路径
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    # H5项目路径（相对于ai-tools目录）
    H5_PROJECT_PATH="${SCRIPT_DIR}/../th_school/h5"
    H5_DEPLOY_PATH="/var/www/yxh5"
    
    # 检查H5项目是否存在
    if [ ! -d "$H5_PROJECT_PATH" ]; then
        print_error "H5项目目录不存在: $H5_PROJECT_PATH"
        print_info "请确保 th_school/h5 目录存在"
        exit 1
    fi
    
    # 保存当前目录
    ORIGINAL_DIR=$(pwd)
    
    # 切换到H5项目目录
    cd "$H5_PROJECT_PATH"
    print_info "当前工作目录: $(pwd)"
    
    # 检查 package.json
    if [ ! -f "package.json" ]; then
        print_error "package.json 不存在"
        exit 1
    fi
    
    # 安装依赖（如果需要）
    if [ ! -d "node_modules" ]; then
        print_info "安装依赖..."
        npm install
    else
        print_info "检查依赖更新..."
        npm install
    fi
    
    # 构建项目
    print_info "构建H5项目..."
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "构建失败，dist 目录不存在"
        exit 1
    fi
    
    # 上传到服务器
    print_info "上传H5项目到服务器..."
    # 先创建目录（如果不存在，需要服务器上已有权限）
    ssh ${SERVER_USER}@${SERVER_HOST} "mkdir -p ${H5_DEPLOY_PATH} 2>/dev/null || true"
    rsync -avz --progress dist/* ${SERVER_USER}@${SERVER_HOST}:${H5_DEPLOY_PATH}/
    
    # 返回原始目录
    cd "$ORIGINAL_DIR"
    
    print_step "✅ YXH5部署完成！"
    echo ""
    echo "🌐 访问地址: https://yxh5.gjson.com"
    echo "📁 部署路径: ${H5_DEPLOY_PATH}"
    echo ""
    echo "💡 提示："
    echo "   - 如果无法访问，请检查DNS解析是否生效"
    echo "   - 检查SSL证书是否正确配置"
    echo "   - 查看Nginx日志: sudo tail -f /var/log/nginx/yxh5_error.log"
    echo "   - 查看访问日志: sudo tail -f /var/log/nginx/yxh5_access.log"
}

# 主循环
main() {
    while true; do
        show_menu
        read choice
        
        case $choice in
            1)
                full_deploy
                ;;
            2)
                quick_update
                ;;
            3)
                update_frontend
                ;;
            4)
                update_backend
                ;;
            5)
                restart_services
                ;;
            6)
                check_status
                ;;
            7)
                view_logs
                ;;
            8)
                update_nginx
                ;;
            9)
                deploy_yxh5
                ;;
            0)
                print_info "退出部署工具"
                exit 0
                ;;
            *)
                print_error "无效的选项，请重新选择"
                ;;
        esac
        
        echo ""
        echo -n "按回车键继续..."
        read
    done
}

# 运行主程序
main
