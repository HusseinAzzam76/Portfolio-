module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { RESEND_API_KEY } = process.env;
  const CONTACT_TO_EMAIL = 'husseinalazzam7@gmail.com';
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'Email service not configured.' });
  }

  const { name, email, subject, message, website } = req.body || {};

  if (website) return res.json({ success: true });

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email and message are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please provide a valid email address.' });
  }
  if (name.length > 120 || email.length > 160 || (subject && subject.length > 160) || message.length > 5000) {
    return res.status(400).json({ error: 'Submission too long.' });
  }

  const esc = (s = '') => String(s).replace(/[&<>"']/g, c => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[c]));

  const cleanSubject = (subject && subject.trim()) || 'New portfolio contact';

  const html = `
    <div style="font-family:system-ui,sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#00cc70;border-bottom:2px solid #00cc70;padding-bottom:8px;">New message from your portfolio</h2>
      <p><strong>From:</strong> ${esc(name)} &lt;${esc(email)}&gt;</p>
      <p><strong>Subject:</strong> ${esc(cleanSubject)}</p>
      <hr style="border:none;border-top:1px solid #ddd;margin:16px 0;" />
      <div style="white-space:pre-wrap;line-height:1.6;">${esc(message)}</div>
    </div>`;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Portfolio Contact <onboarding@resend.dev>',
        to: [CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `[Portfolio] ${cleanSubject}`,
        html,
      }),
    });

    if (!r.ok) {
      const detail = await r.text();
      return res.status(502).json({ error: 'Mail provider rejected the request.', detail });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to send. Try again later.' });
  }
};
