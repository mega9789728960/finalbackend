import pkg from 'pg';
const { Pool } = pkg;

// ✅ Replace with your Supabase connection string
const pool = new Pool({
  connectionString: "postgresql://postgres.fcwajthkxusymctcsmhx:JmRniPEQANk9SpI2@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres",
  
  ssl: {
    rejectUnauthorized: false, // required for Supabase
  },
});

export default pool;
