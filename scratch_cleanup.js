import pg from 'pg';
const pool = new pg.Pool({connectionString:'postgres://8f5ae80c8c6d63f376925beb05ff661d23224e9a64a35e775a5d792014a62ea5:sk_wQGCjSpjc06452OzSSTfk@pooled.db.prisma.io:5432/postgres?sslmode=require'});

const r = await pool.query(`DELETE FROM "Media" WHERE secure_url LIKE '%example.com%'`);
console.log('Deleted test media:', r.rowCount);
await pool.end();
