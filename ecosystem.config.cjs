/** PM2 — runs the CI-built standalone Next.js server (no npm build on server). */
module.exports = {
  apps: [
    {
      name: "tijaar-frontend",
      cwd: __dirname,
      script: ".next/standalone/server.js",
      interpreter: "node",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        HOSTNAME: "0.0.0.0",
      },
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 15,
      watch: false,
    },
  ],
};
