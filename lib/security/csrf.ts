import { isProductionRuntime, isTestRuntime } from '../env.ts';

export function isSameOriginRequest(req: Request): boolean {
  const method = req.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const origin = req.headers.get('origin');
  const host = req.headers.get('host');

  if (!origin) {
    // Browser same-site POSTs send Origin. Missing Origin is allowed in tests and local tools.
    return !isProductionRuntime() || isTestRuntime();
  }

  if (!host) return false;

  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function csrfFailureResponse() {
  return {
    error: 'Request origin was rejected. Refresh the page and try again.',
  };
}
