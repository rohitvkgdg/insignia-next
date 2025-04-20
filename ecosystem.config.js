module.exports = {
  apps: [
    {
      name: 'insignia-next',
      script: './.next/standalone/server.js',
      instances: 3,              // 3 instances for 4 cores (leave 1 for system)
      exec_mode: 'cluster',
      interpreter: 'bun',
      max_memory_restart: '3G',  // Increased for 16GB system
      env_production: {
        PORT: 3000,
        NODE_ENV: 'production',
        RUNTIME: 'bun',
      },
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        RUNTIME: 'bun',
      },
      wait_ready: true,
      kill_timeout: 3000,
      listen_timeout: 10000,     // Added for slower HDD systems
      max_restarts: 10,
      min_uptime: '30s',        // Prevent restart loops
      watch: false,             // Disable watching in production
    },
  ],
}