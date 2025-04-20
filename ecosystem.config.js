module.exports = {
  apps: [
    {
      name: 'insignia-next',
      script: './.next/standalone/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      interpreter: 'bun',
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
    },
  ],
}