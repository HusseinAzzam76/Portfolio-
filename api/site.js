module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();

  const { SUPABASE_URL, SUPABASE_SERVICE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: 'Server misconfigured' });
  }

  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');

  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/site_content?id=eq.1&select=data`, {
      headers: {
        apikey: SUPABASE_SERVICE_KEY,
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
      },
    });
    if (!r.ok) return res.status(r.status).json({ error: 'Upstream error' });
    const rows = await r.json();
    return res.json(rows[0]?.data || {});
  } catch (e) {
    return res.status(500).json({ error: 'Failed to load site content' });
  }
};
