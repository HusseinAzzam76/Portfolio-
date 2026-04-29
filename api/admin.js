const crypto = require('crypto');

function timingSafeCompare(a, b) {
  const aBuf = Buffer.from(String(a || ''));
  const bBuf = Buffer.from(String(b || ''));
  const len = Math.max(aBuf.length, bBuf.length, 1);
  const aPad = Buffer.alloc(len); aBuf.copy(aPad);
  const bPad = Buffer.alloc(len); bBuf.copy(bPad);
  return crypto.timingSafeEqual(aPad, bPad) && aBuf.length === bBuf.length;
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).end();

  const origin = req.headers.origin || req.headers.referer || '';
  const host = req.headers.host || '';
  if (origin && host && !origin.includes(host)) {
    return res.status(403).json({ error: 'Forbidden origin' });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD } = process.env;
  if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'Server misconfigured' });

  const { action, password, data, id } = req.body || {};

  if (!timingSafeCompare(password, ADMIN_PASSWORD)) {
    await new Promise(r => setTimeout(r, 800));
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const headers = {
    apikey: SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
    'Content-Type': 'application/json',
    Prefer: 'return=representation',
  };

  if (action === 'ping') return res.json({ ok: true });

  if (action === 'add') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/writeups`, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    const result = await r.json();
    return res.status(r.ok ? 200 : 400).json(result);
  }

  if (action === 'delete') {
    await fetch(`${SUPABASE_URL}/rest/v1/writeups?id=eq.${id}`, {
      method: 'DELETE', headers,
    });
    return res.json({ success: true });
  }

  if (action === 'video_add') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/videos`, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    const result = await r.json();
    return res.status(r.ok ? 200 : 400).json(result);
  }

  if (action === 'video_delete') {
    await fetch(`${SUPABASE_URL}/rest/v1/videos?id=eq.${id}`, {
      method: 'DELETE', headers,
    });
    return res.json({ success: true });
  }

  if (action === 'project_add') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/projects`, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    const result = await r.json();
    return res.status(r.ok ? 200 : 400).json(result);
  }

  if (action === 'project_delete') {
    await fetch(`${SUPABASE_URL}/rest/v1/projects?id=eq.${id}`, {
      method: 'DELETE', headers,
    });
    return res.json({ success: true });
  }

  if (action === 'cert_add') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/certs`, {
      method: 'POST', headers, body: JSON.stringify(data),
    });
    const result = await r.json();
    return res.status(r.ok ? 200 : 400).json(result);
  }

  if (action === 'cert_delete') {
    await fetch(`${SUPABASE_URL}/rest/v1/certs?id=eq.${id}`, {
      method: 'DELETE', headers,
    });
    return res.json({ success: true });
  }

  if (action === 'site_update') {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_content`, {
      method: 'POST',
      headers: { ...headers, Prefer: 'return=representation,resolution=merge-duplicates' },
      body: JSON.stringify({ id: 1, data, updated_at: new Date().toISOString() }),
    });
    const result = await r.json();
    return res.status(r.ok ? 200 : 400).json(result);
  }

  res.status(400).json({ error: 'Unknown action' });
};
