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
    CREATE TABLE IF NOT EXISTS sightings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pin_type TEXT DEFAULT 'rumored',
      title TEXT NOT NULL,
      description TEXT,
      lat REAL NOT NULL,
      lng REAL NOT NULL,
      address TEXT DEFAULT NULL,
      images TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      author_username TEXT DEFAULT 'codex_user',
      author_avatar TEXT DEFAULT './favicon.png'
    );
  `);

  await db.exec(`
    INSERT INTO sightings (pin_type, title, description, lat, lng, address, author_username) VALUES
    ('event', 'Rohit Jain - Software Engineer @ Google', 'CODEX Alumni. Expert in Agentic AI and full-stack development.', 20.2961, 85.8245, 'City Centre, Bhubaneswar', 'mockuser'),
    ('rumored', 'John Doe - Lead Developer', 'CODEX Mentor. Guiding the next generation of engineers.', 20.2589, 85.7806, 'Khandagiri, Bhubaneswar', 'mockuser'),
    ('confirmed', 'Jane Smith - Frontend Recruit', 'New recruit passionate about React and modern web design.', 20.2383, 85.8338, 'Lingaraj Temple, Bhubaneswar', 'mockuser'),
    ('event', 'Alice Brown - Sr. Data Scientist', 'Alumni working on predictive models and big data architecture.', 20.3012, 85.8179, 'Jayadev Vihar, Bhubaneswar', 'mockuser'),
    ('rumored', 'Bob White - Backend Engineer', 'Mentor specializing in Node.js, microservices, and databases.', 20.2833, 85.8167, 'Master Canteen, Bhubaneswar', 'mockuser'),
    ('confirmed', 'Charlie Green - UI/UX Designer', 'Recruit with an eye for stunning aesthetics and user experience.', 20.2750, 85.7950, 'Nayapalli, Bhubaneswar', 'mockuser'),
    ('event', 'David Black - CTO @ TechStartup', 'Alumni who founded a successful startup in the fintech space.', 20.3500, 85.8200, 'Patia, Bhubaneswar', 'mockuser'),
    ('rumored', 'Eve Adams - DevOps Specialist', 'Mentor teaching Kubernetes, Docker, and CI/CD pipelines.', 20.3200, 85.8000, 'Chandrasekharpur, Bhubaneswar', 'mockuser'),
    ('confirmed', 'Frank Clark - ML Enthusiast', 'Recruit exploring deep learning and neural networks.', 20.2900, 85.8400, 'Saheed Nagar, Bhubaneswar', 'mockuser'),
    ('event', 'Grace Hall - Security Researcher', 'Alumni focusing on zero-day vulnerabilities and infosec.', 20.3100, 85.8300, 'Vani Vihar, Bhubaneswar', 'mockuser'),
    ('rumored', 'Harry Jones - Cloud Architect', 'Mentor helping scale applications on AWS and GCP.', 20.2600, 85.8000, 'Unit 4, Bhubaneswar', 'mockuser'),
    ('confirmed', 'Ivy King - App Developer', 'Recruit building cross-platform mobile apps in Flutter.', 20.2500, 85.8400, 'BJB Nagar, Bhubaneswar', 'mockuser'),
    ('event', 'Jack Lee - Product Manager', 'Alumni leading product strategy at a top tech firm.', 20.3400, 85.8100, 'Infocity, Bhubaneswar', 'mockuser'),
    ('rumored', 'Kelly Moore - Fullstack Dev', 'Mentor with deep knowledge of Next.js and PostgreSQL.', 20.2800, 85.8200, 'Janpath, Bhubaneswar', 'mockuser'),
    ('confirmed', 'Leo Perez - Blockchain Dev', 'Recruit experimenting with smart contracts and Web3.', 20.2700, 85.8300, 'Satya Nagar, Bhubaneswar', 'mockuser');
  `);

  console.log('[DB] Mock Database (SQLite in-memory) ready, with mock data.');
}

function getPool() {
  if (!db) throw new Error('Database not initialized');
  return {
    query: async (sql, params = []) => {
      let query = sql.replace(/NOW\(\)/g, "DATETIME('now')");
      const isSelect = query.trim().toUpperCase().startsWith('SELECT');
      if (isSelect) {
        const rows = await db.all(query, params);
        return [rows];
      } else {
        const result = await db.run(query, params);
        return [{ insertId: result.lastID, affectedRows: result.changes }];
      }
    }
  };
}

module.exports = { initDb, getPool, DB_CONFIG };
