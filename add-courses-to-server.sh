#!/bin/bash
# 在服务器上添加示例课程数据

source deploy/config.prod.sh

echo "📝 添加示例课程数据到服务器..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 上传脚本到服务器
echo "1. 上传脚本到服务器..."
scp backend/add-sample-courses.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}backend/

# 在服务器上执行
echo ""
echo "2. 在服务器上执行脚本..."
ssh ${SERVER_USER}@${SERVER_HOST} << ENDSSH
    cd ${SERVER_PATH}backend
    
    # 检查.env文件是否存在
    if [ ! -f .env ]; then
        echo "❌ 错误: .env文件不存在，请先配置环境变量"
        exit 1
    fi
    
    # 执行脚本
    echo "执行添加课程脚本..."
    node add-sample-courses.js
    
    echo ""
    echo "✅ 完成！"
ENDSSH

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ 课程数据已添加到服务器！"
echo ""
echo "📱 现在可以在手机上测试课程列表了"
