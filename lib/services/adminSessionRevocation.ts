import { tryGetSupabaseAdmin } from '../supabase/admin.ts';

/**
 * Server-side revocation for admin HMAC sessions.
 *
 * Logout records the token's session id in public.admin_session_revocations
 * (service-role only; see supabase/migrations/20261026_pr1_followups.sql).
 * Every authenticated admin request checks that table, so a copied cookie
 * stops working after logout on every instance.
 *
 * Failure policy:
 * - Table missing (migration not applied yet): warn once and treat sessions
 *   as not revoked, so admins are not locked out before the migration lands.
 * - Any other DB error: fail closed (session treated as revoked).
 * - Supabase not configured (local/tests): in-memory list only.
 */
const locallyRevoked = new Map<string, number>();
let warnedMissingTable = false;

function isMissingTable(error: { code?: string; message?: string }): boolean {
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    (/admin_session_revocations/.test(error.message || '') &&
      /does not exist|schema cache/i.test(error.message || ''))
  );
}

function pruneLocal(now = Date.now()) {
  for (const [sid, expiresAt] of locallyRevoked) {
    if (expiresAt <= now) locallyRevoked.delete(sid);
  }
}

export async function isAdminSessionRevoked(sessionId: string): Promise<boolean> {
  pruneLocal();
  if (locallyRevoked.has(sessionId)) return true;

  const admin = tryGetSupabaseAdmin();
  if (!admin) return false;

  const { data, error } = await admin
    .from('admin_session_revocations')
    .select('session_id')
    .eq('session_id', sessionId)
    .maybeSingle();

  if (error) {
    if (isMissingTable(error)) {
      if (!warnedMissingTable) {
        warnedMissingTable = true;
        console.warn(
          '[admin] admin_session_revocations table is missing — apply supabase/migrations/20261026_pr1_followups.sql to enable server-side logout.'
        );
      }
      return false;
    }
    console.error('[admin] revocation lookup failed (failing closed):', error.code, error.message);
    return true;
  }

  if (data) {
    locallyRevoked.set(sessionId, Date.now() + 60 * 60 * 1000);
    return true;
  }
  return false;
}

/** Returns true when the revocation was persisted (or Supabase is not configured). */
export async function revokeAdminSession(sessionId: string, expiresAt: number): Promise<boolean> {
  locallyRevoked.set(sessionId, expiresAt);

  const admin = tryGetSupabaseAdmin();
  if (!admin) return true;

  const { error } = await admin.from('admin_session_revocations').upsert({
    session_id: sessionId,
    expires_at: new Date(expiresAt).toISOString(),
  });
  if (error) {
    console.error('[admin] failed to persist session revocation:', error.code, error.message);
    return false;
  }

  // Best-effort housekeeping: expired tokens are rejected anyway.
  await admin
    .from('admin_session_revocations')
    .delete()
    .lt('expires_at', new Date().toISOString())
    .then(({ error: pruneError }) => {
      if (pruneError) console.warn('[admin] revocation prune failed:', pruneError.message);
    });

  return true;
}
