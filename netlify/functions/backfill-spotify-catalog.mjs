export const config = {
  schedule: '17 * * * *',
};

const APP_ID = process.env.BASE44_APP_ID || process.env.VITE_BASE44_APP_ID || '6a0285069dbc9db7d3093799';
const BACKFILL_SECRET = process.env.BACKFILL_SECRET;
const BASE44_API_BASE = process.env.BASE44_API_BASE || 'https://base44.app/api';

export default async () => {
  if (!BACKFILL_SECRET) {
    return new Response(JSON.stringify({ error: 'Missing BACKFILL_SECRET' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  const response = await fetch(`${BASE44_API_BASE}/apps/${APP_ID}/functions/backfillSpotifyCatalog`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      accept: 'application/json',
      'x-app-id': APP_ID,
      'x-backfill-secret': BACKFILL_SECRET,
    },
    body: JSON.stringify({ limit: Number(process.env.BACKFILL_BATCH_SIZE || 3) }),
  });

  const text = await response.text();

  return new Response(text, {
    status: response.status,
    headers: { 'content-type': response.headers.get('content-type') || 'application/json' },
  });
};
