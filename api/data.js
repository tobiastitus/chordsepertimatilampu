// Shared storage for the Kosmus Karangpanas Chord Book.
// Runs as a Vercel serverless function at  /api/data
//
//   GET  /api/data   -> anyone can read the shared songs + setlists
//   POST /api/data   -> editors only (needs the EDITOR_PASSCODE) to verify or save
//
// Data lives in an Upstash Redis database that you connect from the Vercel
// dashboard (see README.md). No code changes are needed.

const crypto = require('crypto');

const DATA_KEY = 'kosmus-chordbook:data';
const BACKUP_KEY = 'kosmus-chordbook:previous';
const MAX_BYTES = 900 * 1024; // stay under Upstash's 1 MB request limit

function redisConfig() {
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

async function redis(command) {
  const cfg = redisConfig();
  const r = await fetch(cfg.url, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + cfg.token, 'Content-Type': 'application/json' },
    body: JSON.stringify(command),
  });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'Database error ' + r.status);
  return j.result;
}

function safeEqual(a, b) {
  const x = Buffer.from(String(a || ''));
  const y = Buffer.from(String(b || ''));
  if (x.length !== y.length) return false;
  return crypto.timingSafeEqual(x, y);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  // ---------- READ (everyone) ----------
  if (req.method === 'GET') {
    if (!redisConfig()) return res.status(200).json({ configured: false });
    try {
      const raw = await redis(['GET', DATA_KEY]);
      if (!raw) return res.status(200).json({ configured: true, version: 0, data: null });
      const doc = JSON.parse(raw);
      return res.status(200).json({ configured: true, version: doc.version, updatedAt: doc.updatedAt, data: doc.data });
    } catch (e) {
      return res.status(500).json({ error: 'Could not read the shared data.' });
    }
  }

  // ---------- WRITE (editors only) ----------
  if (req.method === 'POST') {
    let body = req.body;
    if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
    body = body || {};

    const expected = process.env.EDITOR_PASSCODE;
    if (!expected) {
      return res.status(503).json({ error: 'The editor passcode has not been set on the server yet (EDITOR_PASSCODE).' });
    }
    if (!safeEqual(body.passcode, expected)) {
      await sleep(700); // slow down guessing
      return res.status(401).json({ error: 'Wrong passcode.' });
    }

    if (body.action === 'verify') return res.status(200).json({ ok: true });

    if (body.action === 'save') {
      if (!redisConfig()) return res.status(503).json({ error: 'The shared database is not connected yet.' });
      const data = body.data;
      if (!data || !Array.isArray(data.songs) || !Array.isArray(data.setlists)) {
        return res.status(400).json({ error: 'Invalid data.' });
      }
      if (JSON.stringify(data).length > MAX_BYTES) {
        return res.status(413).json({ error: 'Too much data to save.' });
      }
      try {
        const currentRaw = await redis(['GET', DATA_KEY]);
        const currentVersion = currentRaw ? JSON.parse(currentRaw).version || 0 : 0;
        if (!body.force && Number(body.baseVersion) !== currentVersion) {
          return res.status(409).json({ error: 'conflict', version: currentVersion });
        }
        if (currentRaw) await redis(['SET', BACKUP_KEY, currentRaw]); // keep one step of history
        const doc = { version: currentVersion + 1, updatedAt: new Date().toISOString(), data };
        await redis(['SET', DATA_KEY, JSON.stringify(doc)]);
        return res.status(200).json({ ok: true, version: doc.version, updatedAt: doc.updatedAt });
      } catch (e) {
        return res.status(500).json({ error: 'Could not save to the shared database.' });
      }
    }
    return res.status(400).json({ error: 'Unknown action.' });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'Method not allowed' });
};
