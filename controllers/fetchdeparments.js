import pool from "../database/database.js";

async function fetchdepartments(req, res) {
  try {
    const result = await pool.query(`SELECT department FROM departments`);
    
    // ✅ Convert rows into list of strings
    const departments = result.rows.map(row => row.department);

    return res.json({ success: true, result: departments });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default fetchdepartments;
