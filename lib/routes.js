import handler0 from '../api/auth/login.js';
import handler1 from '../api/auth/logout.js';
import handler2 from '../api/auth/session.js';
import handler3 from '../api/meta/whatsapp/callback.js';
import handler4 from '../api/meta/whatsapp/disconnect.js';
import handler5 from '../api/meta/whatsapp/management.js';
import handler6 from '../api/meta/whatsapp/messages.js';
import handler7 from '../api/meta/whatsapp/refresh.js';
import handler8 from '../api/meta/whatsapp/signup/start.js';
import handler9 from '../api/meta/whatsapp/status.js';
import handler10 from '../api/meta/whatsapp/webhook.js';

export const routes = new Map([
  ['/api/auth/login', handler0],
  ['/api/auth/logout', handler1],
  ['/api/auth/session', handler2],
  ['/api/meta/whatsapp/callback', handler3],
  ['/api/meta/whatsapp/disconnect', handler4],
  ['/api/meta/whatsapp/management', handler5],
  ['/api/meta/whatsapp/messages', handler6],
  ['/api/meta/whatsapp/refresh', handler7],
  ['/api/meta/whatsapp/signup/start', handler8],
  ['/api/meta/whatsapp/status', handler9],
  ['/api/meta/whatsapp/webhook', handler10],
]);
