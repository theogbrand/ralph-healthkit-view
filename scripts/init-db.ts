import { getDb, closeDb } from '../src/lib/db/client';

console.log('Initializing database...');

try {
  const db = getDb();
  const tables = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' ORDER BY name
  `).all() as { name: string }[];

  console.log('Tables created:');
  for (const t of tables) {
    console.log(`  - ${t.name}`);
  }

  closeDb();
  console.log('Database initialized successfully.');
} catch (error) {
  console.error('Failed to initialize database:', error);
  process.exit(1);
}
