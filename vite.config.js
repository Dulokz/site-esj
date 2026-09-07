import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { routes } from './lib/routes.js'

const localApi = {
  name: 'local-meta-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0];
      const handler = routes.get(path);
      if (handler) return handler(req, res);
      next();
    });
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApi],
})
