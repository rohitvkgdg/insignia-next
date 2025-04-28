module.exports = {
  apps: [{
    name: "insignia-next",
    script: "node_modules/next/dist/bin/next",
    args: "start",
    instances: 3,
    autorestart: true,
    watch: false,
    max_memory_restart: '3G',
    env: {
      PORT: 5174,
      NODE_ENV: "development"
    },
    env_production: {
      PORT: 5174,
      NODE_ENV: "production"
    },
    wait_ready: true,
    kill_timeout: 3000,
    listen_timeout: 10000,
    max_restarts: 10,
    min_uptime: '30s',
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    error_file: "./logs/pm2-error.log",
    out_file: "./logs/pm2-output.log",
    time: true
  }]
};
