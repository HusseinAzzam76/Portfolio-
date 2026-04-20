module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY, ADMIN_PASSWORD } = process.env;
  const { action, password, data, id } = req.body;

  if (!password || password !== ADMIN_PASSWORD) {
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

  res.status(400).json({ error: 'Unknown action' });
};
