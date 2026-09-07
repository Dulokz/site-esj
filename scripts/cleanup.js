import { closeDatabase,transaction } from '../lib/platform/db.js';
try {
  await transaction(async(tx)=>{
    await tx.query("DELETE FROM signup_attempts WHERE expires_at < now()-interval '1 day'");
    await tx.query('DELETE FROM sessions WHERE expires_at<now()');
    await tx.query('DELETE FROM rate_limits WHERE expires_at<now()');
    await tx.query("DELETE FROM webhook_events WHERE received_at<now()-interval '30 days'");
    await tx.query("DELETE FROM audit_events WHERE created_at<now()-interval '180 days'");
    // Keep idempotency tombstones; dropping message_requests could permit duplicate sends.
  });
  console.log('Limpeza concluída.');
} catch { console.error('Limpeza não concluída.'); process.exitCode=1; }
finally { await closeDatabase(); }
