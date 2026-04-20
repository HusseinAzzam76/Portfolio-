module.exports = async (req, res) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.json([]);
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/videos?select=*&order=date.desc.nullslast`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
  );
  const data = await r.json();
  res.json(Array.isArray(data) ? data : []);
};
