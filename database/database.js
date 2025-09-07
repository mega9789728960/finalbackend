import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials
const SUPABASE_URL = "https://fcwajthkxusymctcsmhx.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjd2FqdGhreHVzeW1jdGNzbWh4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjM4MzkyNywiZXhwIjoyMDcxOTU5OTI3fQ.FU_KHE5nLx8xOPoA8b-qxKDb-bNSEs6dhFz2g0gJ-nM"
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);



export default supabase;