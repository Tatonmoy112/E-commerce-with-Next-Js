import pg from 'pg';

async function getMediaAndCategory() {
  const connectionString = "postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require";
  const pool = new pg.Pool({ connectionString });

  try {
    const media = await pool.query('SELECT id FROM "Media" LIMIT 1');
    const category = await pool.query('SELECT id FROM "Category" ORDER BY "createdAt" DESC LIMIT 1');
    
    console.log("Found Media ID:", media.rows[0]?.id);
    console.log("Found Category ID:", category.rows[0]?.id);
  } catch (err) {
    console.error("Error:", err.message);
  } finally {
    await pool.end();
  }
}

getMediaAndCategory();
