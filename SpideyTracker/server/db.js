const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const DB_CONFIG = {
  database: 'spidey_mock_db (in-memory sqlite)'
};

let db = null;

async function initDb() {
  db = await open({
    filename: ':memory:', // Use in-memory DB for mocking
    driver: sqlite3.Database
  });

  // Create tables using SQLite syntax
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      username TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      avatar TEXT DEFAULT NULL,
      email_verified INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS email_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sightings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pin_type TEXT DEFAULT 'rumored',
      title TEXT NOT NULL,
      description TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      address TEXT DEFAULT NULL,
      images TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      sighting_id INTEGER DEFAULT NULL,
      pin_id TEXT DEFAULT NULL,
      title TEXT NOT NULL,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      thumb TEXT DEFAULT NULL,
      pin_type TEXT DEFAULT 'confirmed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (sighting_id) REFERENCES sightings(id) ON DELETE CASCADE
    );
  `);

  await db.exec(`
    INSERT INTO users (email, username, password_hash, email_verified)
    SELECT 'mock@example.com', 'mockuser', 'mockhash', 1
    WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'mock@example.com');
    
    INSERT INTO sightings (user_id, pin_type, title, description, lat, lng, address) VALUES
    (1, 'event', 'Rohit Jain - Software Engineer @ Google', 'CODEX Alumni. Expert in Agentic AI and full-stack development.', 20.2961, 85.8245, 'City Centre, Bhubaneswar'),
    (1, 'rumored', 'John Doe - Lead Developer', 'CODEX Mentor. Guiding the next generation of engineers.', 20.2589, 85.7806, 'Khandagiri, Bhubaneswar'),
    (1, 'confirmed', 'Jane Smith - Frontend Recruit', 'New recruit passionate about React and modern web design.', 20.2383, 85.8338, 'Lingaraj Temple, Bhubaneswar'),
    (1, 'event', 'Alice Brown - Sr. Data Scientist', 'Alumni working on predictive models and big data architecture.', 20.3012, 85.8179, 'Jayadev Vihar, Bhubaneswar'),
    (1, 'rumored', 'Bob White - Backend Engineer', 'Mentor specializing in Node.js, microservices, and databases.', 20.2833, 85.8167, 'Master Canteen, Bhubaneswar'),
    (1, 'confirmed', 'Charlie Green - UI/UX Designer', 'Recruit with an eye for stunning aesthetics and user experience.', 20.2750, 85.7950, 'Nayapalli, Bhubaneswar'),
    (1, 'event', 'David Black - CTO @ TechStartup', 'Alumni who founded a successful startup in the fintech space.', 20.3500, 85.8200, 'Patia, Bhubaneswar'),
    (1, 'rumored', 'Eve Adams - DevOps Specialist', 'Mentor teaching Kubernetes, Docker, and CI/CD pipelines.', 20.3200, 85.8000, 'Chandrasekharpur, Bhubaneswar'),
    (1, 'confirmed', 'Frank Clark - ML Enthusiast', 'Recruit exploring deep learning and neural networks.', 20.2900, 85.8400, 'Saheed Nagar, Bhubaneswar'),
    (1, 'event', 'Grace Hall - Security Researcher', 'Alumni focusing on zero-day vulnerabilities and infosec.', 20.3100, 85.8300, 'Vani Vihar, Bhubaneswar'),
    (1, 'rumored', 'Harry Jones - Cloud Architect', 'Mentor helping scale applications on AWS and GCP.', 20.2600, 85.8000, 'Unit 4, Bhubaneswar'),
    (1, 'confirmed', 'Ivy King - App Developer', 'Recruit building cross-platform mobile apps in Flutter.', 20.2500, 85.8400, 'BJB Nagar, Bhubaneswar'),
    (1, 'event', 'Jack Lee - Product Manager', 'Alumni leading product strategy at a top tech firm.', 20.3400, 85.8100, 'Infocity, Bhubaneswar'),
    (1, 'rumored', 'Kelly Moore - Fullstack Dev', 'Mentor with deep knowledge of Next.js and PostgreSQL.', 20.2800, 85.8200, 'Janpath, Bhubaneswar'),
    (1, 'confirmed', 'Leo Perez - Blockchain Dev', 'Recruit experimenting with smart contracts and Web3.', 20.2700, 85.8300, 'Satya Nagar, Bhubaneswar');
  `);

  console.log('[DB] Mock Database (SQLite in-memory) and tables ready, with mock data.');
}

function getPool() {
  if (!db) throw new Error('Database not initialized');
  
  // Wrapper to match mysql2 API
  return {
    query: async (sql, params = []) => {
      // Fix some MySQL specific functions if necessary (e.g. NOW())
      let query = sql.replace(/NOW\(\)/g, "DATETIME('now')");
      
      const isSelect = query.trim().toUpperCase().startsWith('SELECT');
      
      if (isSelect) {
        const rows = await db.all(query, params);
        return [rows]; // mysql2 returns [rows, fields]
      } else {
        const result = await db.run(query, params);
        // mysql2 returns [resultHeader] with insertId and affectedRows
        return [{
          insertId: result.lastID,
          affectedRows: result.changes
        }];
      }
    }
  };
}

module.exports = { initDb, getPool, DB_CONFIG };
