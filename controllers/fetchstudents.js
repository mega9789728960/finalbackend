import pool from "../database/database.js";

async function fetchstudent(req, res) {
  try {
    // ✅ Correct way to read token
    const token = req.body.token;  // <-- no destructuring

    const result = await pool.query("SELECT * FROM students");
    const data = result.rows;

    console.log(data);

    return res.status(200).json({
  // ✅ now it will show up
      success: true,
      message: "Students fetched successfully",
      count: data.length,
      students: data,
           token: token 
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

export default fetchstudent;
