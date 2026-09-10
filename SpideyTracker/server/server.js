const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { initDb, getPool } = require('./db');

const PORT = Number(process.env.PORT || 8899);
const SITE_DIR = path.join(__dirname, '..', 'spideytracker.net');

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// ---------- XFeed Community stream ----------
app.get('/x-feed.php', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sightings ORDER BY created_at DESC LIMIT 50');
    const posts = rows.map(function (r) {
      const imgs = parseImages(r.images);
      return {
        id: 'usr-' + r.id,
        text: r.title + (r.description ? String.fromCharCode(10) + r.description : ''),
        created_at: r.created_at,
        author: { name: r.author_username, username: r.author_username, avatar_url: r.author_avatar || './favicon.png' },
        media: imgs.map(function (src) { return { type: 'photo', url: src, alt_text: r.title }; }),
      };
    });
    res.json({ posts: posts });
  } catch (e) {
    console.error('[x-feed]', e);
    res.json({ posts: [] });
  }
});

// ---------- Static resources ----------
app.use(express.static(SITE_DIR, { extensions: ['html'] }));

// Images field compatibility
function parseImages(v) {
  if (!v) return [];
  try {
    let parsed = JSON.parse(v);
    if (typeof parsed === 'string') parsed = JSON.parse(parsed);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (e) {
    return [v];
  }
}

// ---------- API: Sightings ----------
app.get('/api/sightings', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sightings ORDER BY created_at DESC');
    const items = rows.map((r) => ({
      id: 'usr-' + r.id,
      pinType: r.pin_type || 'rumored',
      title: r.title,
      description: r.description || '',
      lat: Number(r.lat),
      lng: Number(r.lng),
      address: r.address || '',
      images: parseImages(r.images),
      cardThumbImg: parseImages(r.images)[0] || '',
      createdAt: r.created_at,
      author: { username: r.author_username, avatar: r.author_avatar },
    }));
    res.json({ sightings: items });
  } catch (e) {
    console.error('[sightings list]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Start ----------
(async () => {
  try {
    await initDb();
  } catch (e) {
    console.error('[DB] Init failed:', e.message);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log('');
    console.log('🕷️  Spidey Tracker Server started');
    console.log('  Address: http://127.0.0.1:' + PORT + ' / http://spideytracker.net:' + PORT);
    console.log('  Static site: ' + SITE_DIR);
    console.log('');
  });
})();
