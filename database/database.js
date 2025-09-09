import pkg from 'pg';
const { Pool } = pkg;

// ✅ Replace with your Supabase connection string
const pool = new Pool({
  connectionString: "postgresql://postgres:8C4ovxsz5I1J64PN@db.fcwajthkxusymctcsmhx.supabase.co:5432/postgres",
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
});

export default pool;
