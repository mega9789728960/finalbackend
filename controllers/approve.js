import pool from "../database/database.js";

async function approve(req, res) {
  try {
    const { registerno } = req.body;

    // ✅ Validate input
    if (!registerno) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    // ✅ Check if student exists
    const studentResult = await pool.query(
      "SELECT * FROM students WHERE registration_number = $1",
      [registerno]
    );

    if (studentResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No student found with this registration number",
      });
    }

    // ✅ Update student status to 'active'
    const updateResult = await pool.query(
      "UPDATE students SET status = $1 WHERE registration_number = $2 RETURNING *",
      ["active", registerno]
    );

    const updatedStudent = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      message: "Student approved successfully",
      student: updatedStudent,
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

export default approve;
