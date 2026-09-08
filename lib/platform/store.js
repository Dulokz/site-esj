import { randomUUID } from 'node:crypto';
import { hash, HttpError } from './security.js';
export async function rateLimit(db, key, limit = 20, seconds = 60) {
  const { rows } = await db.query(`INSERT INTO rate_limits(key,count,expires_at) VALUES($1,1,now()+$2*interval '1 second')
    ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.expires_at<=now() THEN 1 ELSE rate_limits.count+1 END,
    expires_at=CASE WHEN rate_limits.expires_at<=now() THEN excluded.expires_at ELSE rate_limits.expires_at END RETURNING count`, [hash(key), seconds]);
  if (rows[0].count > limit) throw new HttpError(429, 'rate_limited');
}
export const audit = (db, context, event, resourceId = null) => db.query('INSERT INTO audit_events(id,tenant_id,user_id,event,resource_id) VALUES($1,$2,$3,$4,$5)', [randomUUID(), context.tenantId, context.userId, event, resourceId]);
export function signupStore(db) {
  return {
    insert: async (item) => db.query(`INSERT INTO signup_attempts(id,tenant_id,user_id,session_id,state_hash,expires_at,outcome) VALUES($1,$2,$3,$4,$5,$6,'pending')`, [randomUUID(), item.tenantId, item.userId, item.sessionId, item.stateHash, new Date(item.expiresAt)]),
    consume: async (item) => {
      const result = await db.query(`UPDATE signup_attempts SET consumed_at=now() WHERE state_hash=$1 AND tenant_id=$2 AND user_id=$3 AND session_id=$4 AND consumed_at IS NULL AND expires_at>now() RETURNING id`, [item.stateHash, item.tenantId, item.userId, item.sessionId]);
      return result.rowCount === 1;
    },
    consumeDetailed: async (item) => {
      const result = await db.query(`UPDATE signup_attempts SET consumed_at=now() WHERE state_hash=$1 AND tenant_id=$2 AND user_id=$3 AND session_id=$4 AND consumed_at IS NULL AND expires_at>now() RETURNING id`, [item.stateHash, item.tenantId, item.userId, item.sessionId]);
      if(result.rowCount===1)return {consumed:true,located:true,expired:false,used:false,contextMatch:true,reason:'consumed'};
      const found=await db.query('SELECT tenant_id,user_id,session_id,consumed_at,expires_at FROM signup_attempts WHERE state_hash=$1 LIMIT 1',[item.stateHash]);
      const row=found.rows[0];
      if(!row)return {consumed:false,located:false,expired:false,used:false,contextMatch:false,reason:'not_found'};
      const contextMatch=row.tenant_id===item.tenantId && row.user_id===item.userId && row.session_id===item.sessionId;
      const used=Boolean(row.consumed_at),expired=new Date(row.expires_at).getTime()<=Date.now();
      return {consumed:false,located:true,expired,used,contextMatch,reason:!contextMatch?'context_mismatch':used?'already_used':expired?'expired':'not_consumed'};
    },
  };
}
export async function connection(db, context, id, statuses = ['connected']) {
  const { rows } = await db.query('SELECT * FROM whatsapp_connections WHERE id=$1 AND tenant_id=$2', [id, context.tenantId]);
  if (!rows[0]) throw new HttpError(404, 'connection_not_found');
  if (!statuses.includes(rows[0].status)) throw new HttpError(409, 'connection_unavailable');
  return rows[0];
}
