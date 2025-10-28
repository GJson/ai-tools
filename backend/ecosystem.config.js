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
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024',
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s',
    watch: false,
    ignore_watch: ['node_modules', 'uploads', '*.log'],
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
