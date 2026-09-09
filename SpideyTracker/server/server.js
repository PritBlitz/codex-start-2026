const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { initDb, getPool } = require('./db');

const PORT = Number(process.env.PORT || 8899);
const SITE_DIR = path.join(__dirname, '..', 'spideytracker.net');
const UPLOAD_DIR = path.join(SITE_DIR, 'uploads');
// JWT signature key
const JWT_SECRET = process.env.JWT_SECRET || require('crypto').randomBytes(32).toString('hex');
const COOKIE_NAME = 'spidey_token';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ---------- XFeed Community stream ----------
app.get('/x-feed.php', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT s.id, s.title, s.description, s.images, s.created_at, u.username FROM sightings s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC LIMIT 50');
    const posts = rows.map(function (r) {
      const imgs = parseImages(r.images);
      return {
        id: 'usr-' + r.id,
        text: r.title + (r.description ? String.fromCharCode(10) + r.description : ''),
        created_at: r.created_at,
        author: { name: r.username, username: r.username, avatar_url: './favicon.png' },
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
// Upload directory
app.use('/uploads', express.static(UPLOAD_DIR));

// ---------- Image upload config ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg').toLowerCase() || '.jpg';
    cb(null, Date.now() + '_' + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024, files: 6 },
  fileFilter: (req, file, cb) => {
    if (/^image\//.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// ---------- Auth middleware ----------
function auth(req, res, next) {
  const token = req.cookies && req.cookies[COOKIE_NAME] || (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.uid;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Login expired' });
  }
}
// Cookie parsing
app.use((req, res, next) => {
  const raw = req.headers.cookie || '';
  req.cookies = {};
  raw.split(';').forEach((pair) => {
    const i = pair.indexOf('=');
    if (i > 0) req.cookies[pair.slice(0, i).trim()] = decodeURIComponent(pair.slice(i + 1).trim());
  });
  next();
});

// ---------- Utils ----------
function genCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}
function sendVerifyCode(email, code) {
  // Local testing: print to console
  const line = `[Email Verification] ${email} registration code: ${code}`;
  console.log('\n========================================');
  console.log(line);
  console.log('========================================\n');
  try {
    const logPath = path.join(__dirname, 'verify-codes.log');
    fs.appendFileSync(logPath, new Date().toISOString() + ' ' + line + '\n', 'utf8');
  } catch (e) { /* Write file failed */ }

  // SMTP real email
  if (String(process.env.SMTP_ENABLED) === 'true') {
    try {
      const nodemailer = require('nodemailer');
      const smtpPort = Number(process.env.SMTP_PORT || 465);
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || '',
        port: smtpPort,
        secure: smtpPort === 465,
        auth: { user: process.env.SMTP_USER || '', pass: process.env.SMTP_PASS || '' },
      });
      transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER || 'Spidey Tracker',
        to: email,
        subject: 'Spidey Tracker - Registration Code',
        text: `Your registration code is: ${code}, valid for 5 minutes.`,
        html: `<p>Your registration code is: <b style="font-size:20px">${code}</b></p><p>Valid for 5 minutes, do not share it.</p>`,
      }).then(() => console.log('  [SMTP] Verification code email sent to ' + email))
        .catch((e) => console.warn('  [SMTP] Email send failed:', e.message));
    } catch (e) {
      console.warn('  [SMTP] Send config error:', e.message);
    }
  }
}function signToken(uid) {
  return jwt.sign({ uid }, JWT_SECRET, { expiresIn: '30d' });
}
// Images field compatibility
function parseImages(v) {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  try {
    const p = JSON.parse(v);
    return Array.isArray(p) ? p : [];
  } catch (e) {
    return [];
  }
}

// ---------- API: Auth ----------
// 1) Register: send code
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, username, password } = req.body || {};
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return res.status(400).json({ error: 'Invalid email format' });
    if (!username || String(username).trim().length < 2) return res.status(400).json({ error: 'Username must be at least 2 characters' });
    if (!password || String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
    const pool = getPool();
    const [rows] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
    if (rows.length) return res.status(409).json({ error: 'Email already registered, please login directly' });
    const code = genCode();
    await pool.query(
      'INSERT INTO email_codes (email, code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 10 MINUTE))',
      [email.trim(), code]
    );
    sendVerifyCode(email.trim(), code);
    res.json({ ok: true, message: 'Verification code sent (check server console for local test)' });
  } catch (e) {
    console.error('[register]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// 2) Code + create account
app.post('/api/auth/verify', async (req, res) => {
  try {
    const { email, code, username, password } = req.body || {};
    if (!email || !code) return res.status(400).json({ error: 'Missing parameters' });
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT * FROM email_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1',
      [email.trim(), String(code).trim()]
    );
    if (!rows.length) return res.status(400).json({ error: 'Verification code is incorrect or expired' });
    await pool.query('UPDATE email_codes SET used = 1 WHERE id = ?', [rows[0].id]);
    const hash = await bcrypt.hash(String(password), 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, username, password_hash, email_verified) VALUES (?, ?, ?, 1)',
      [email.trim(), String(username).trim(), hash]
    );
    const token = signToken(result.insertId);
    res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
    res.json({ ok: true, user: { id: result.insertId, email: email.trim(), username: String(username).trim() } });
  } catch (e) {
    console.error('[verify]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// 3) Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Please enter email and password' });
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email.trim()]);
    if (!rows.length) return res.status(401).json({ error: 'Email or password incorrect' });
    const user = rows[0];
    const ok = await bcrypt.compare(String(password), user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Email or password incorrect' });
    const token = signToken(user.id);
    res.cookie(COOKIE_NAME, token, { httpOnly: true, sameSite: 'lax', maxAge: 30 * 24 * 3600 * 1000 });
    res.json({ ok: true, user: { id: user.id, email: user.email, username: user.username, avatar: user.avatar } });
  } catch (e) {
    console.error('[login]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// 4) Current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT id, email, username, avatar, email_verified, created_at FROM users WHERE id = ?', [req.userId]);
    if (!rows.length) return res.status(404).json({ error: 'User not found' });
    res.json({ user: rows[0] });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// 5) Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME);
  res.json({ ok: true });
});

// ---------- API: Sightings ----------
// List (with author info)
app.get('/api/sightings', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT s.id, s.user_id, s.pin_type, s.title, s.description, s.lat, s.lng, s.address, s.images, s.created_at, u.username, u.avatar FROM sightings s JOIN users u ON u.id = s.user_id ORDER BY s.created_at DESC'
    );
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
      author: { id: r.user_id, username: r.username, avatar: r.avatar },
    }));
    res.json({ sightings: items });
  } catch (e) {
    console.error('[sightings list]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Publish (image + fields)
app.post('/api/sightings', auth, upload.array('images', 6), async (req, res) => {
  try {
    const { title, description, lat, lng, address, pin_type } = req.body || {};
    if (!title || !String(title).trim()) return res.status(400).json({ error: 'Please fill in the title' });
    const latN = Number(lat);
    const lngN = Number(lng);
    if (!Number.isFinite(latN) || !Number.isFinite(lngN) || Math.abs(latN) > 90 || Math.abs(lngN) > 180) {
      return res.status(400).json({ error: 'Invalid coordinates, please select a location on the map' });
    }
    const files = (req.files || []).map((f) => '/uploads/' + f.filename);
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO sightings (user_id, pin_type, title, description, lat, lng, address, images) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, pin_type === 'confirmed' ? 'confirmed' : 'rumored', String(title).trim(), String(description || '').trim(), latN, lngN, String(address || '').trim() || null, JSON.stringify(files)]
    );
    res.json({ ok: true, id: result.insertId, message: 'Sighting posted!' });
  } catch (e) {
    console.error('[sighting create]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete own sighting
app.delete('/api/sightings/:id', auth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const pool = getPool();
    const [rows] = await pool.query('SELECT * FROM sightings WHERE id = ? AND user_id = ?', [id, req.userId]);
    if (!rows.length) return res.status(404).json({ error: 'Sighting not found or unauthorized to delete' });
    // Delete associated images
    const imgs = parseImages(rows[0].images);
    if (imgs.length) {
      imgs.forEach((p) => {
        const fp = path.join(SITE_DIR, p.replace(/^\//, ''));
        if (fs.existsSync(fp)) fs.unlinkSync(fp);
      });
    }
    await pool.query('DELETE FROM sightings WHERE id = ?', [id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- API: Favorites ----------
app.post('/api/favorites', auth, async (req, res) => {
  try {
    const { sighting_id, pin_id, title, lat, lng, thumb, pin_type } = req.body || {};
    if (!title || !Number.isFinite(Number(lat)) || !Number.isFinite(Number(lng))) {
      return res.status(400).json({ error: 'Incomplete favorite info' });
    }
    const pool = getPool();
    // Prevent duplicate
    const [dup] = await pool.query(
      'SELECT id FROM favorites WHERE user_id = ? AND ((sighting_id = ? AND ? IS NOT NULL) OR (pin_id = ? AND pin_id IS NOT NULL))',
      [req.userId, sighting_id || null, sighting_id || null, pin_id || null, pin_id || null]
    );
    if (dup.length) return res.json({ ok: true, duplicated: true, message: 'Already favorited' });
    await pool.query(
      'INSERT INTO favorites (user_id, sighting_id, pin_id, title, lat, lng, thumb, pin_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.userId, sighting_id || null, pin_id || null, String(title).slice(0, 255), Number(lat), Number(lng), thumb || null, pin_type || 'confirmed']
    );
    res.json({ ok: true, message: 'Favorited' });
  } catch (e) {
    console.error('[fav add]', e);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/favorites', auth, async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query(
      'SELECT id, sighting_id, pin_id, title, lat, lng, thumb, pin_type, created_at FROM favorites WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json({ favorites: rows });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.delete('/api/favorites/:id', auth, async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM favorites WHERE id = ? AND user_id = ?', [Number(req.params.id), req.userId]);
    res.json({ ok: true, affected: result.affectedRows });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ---------- Start ----------
(async () => {
  try {
    await initDb();
  } catch (e) {
    console.error('[DB] Init failed:', e.message);
    console.error('Please check DB_PASS in .env');
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log('');
    console.log('🕷️  Spidey TrackerServer started');
    console.log('  Address: http://127.0.0.1:' + PORT + ' / http://spideytracker.net:' + PORT);
    console.log('  Static site: ' + SITE_DIR);
    console.log('  Upload dir: ' + UPLOAD_DIR);
    console.log('');
  });
})();
