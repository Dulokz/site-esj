import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import status from './api/meta/whatsapp/status.js'
import callback from './api/meta/whatsapp/callback.js'
import login from './api/auth/login.js'
import session from './api/auth/session.js'
import logout from './api/auth/logout.js'
import start from './api/meta/whatsapp/signup/start.js'
import disconnect from './api/meta/whatsapp/disconnect.js'
import management from './api/meta/whatsapp/management.js'
import messages from './api/meta/whatsapp/messages.js'
import refresh from './api/meta/whatsapp/refresh.js'
import webhook from './api/meta/whatsapp/webhook.js'

const localApi = {
  name: 'local-meta-api',
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const path = req.url?.split('?')[0];
      const routes = { '/api/auth/login':login, '/api/auth/session':session, '/api/auth/logout':logout,
        '/api/meta/whatsapp/signup/start':start, '/api/meta/whatsapp/disconnect':disconnect,
        '/api/meta/whatsapp/management':management, '/api/meta/whatsapp/messages':messages,
        '/api/meta/whatsapp/refresh':refresh, '/api/meta/whatsapp/webhook':webhook };
      if(routes[path]) return routes[path](req,res);
      if (path === '/api/meta/whatsapp/status') return status(req, res);
      if (path === '/api/meta/whatsapp/callback') return callback(req, res);
      next();
    });
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localApi],
})
