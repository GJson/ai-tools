module.exports = {
  apps: [{
    name: 'ai-tools-backend',
    script: 'src/app.js',
    cwd: '/opt/ai-tools-backend/backend',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: '/var/log/ai-tools-backend/error.log',
    out_file: '/var/log/ai-tools-backend/access.log',
    log_file: '/var/log/ai-tools-backend/combined.log',
    time: true,
    // 内存限制
    max_memory_restart: '512M',
    node_args: '--max-old-space-size=512',
    // 自动重启配置
    autorestart: true,
    restart_delay: 5000, // 重启延迟5秒
    max_restarts: 50, // 最大重启次数（增加）
    min_uptime: '10s', // 最小运行时间
    // 监听配置
    watch: false,
    ignore_watch: ['node_modules', 'uploads', '*.log', '.git'],
    // 进程管理
    kill_timeout: 5000, // 优雅关闭超时时间
    wait_ready: false,
    listen_timeout: 10000, // 监听超时
    shutdown_with_message: true,
    // 环境变量
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
