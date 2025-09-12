import pool from "../database/database.js";

async function approve(req, res) {
  try {
    const { registerno, token } = req.body;

    // ✅ Validate input
    if (!registerno) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    // ✅ Update student status and return only needed columns
    const updateResult = await pool.query(
      `UPDATE students 
       SET status = $1 
       WHERE registration_number = $2 
       RETURNING id, registration_number, email, status`,
      ["active", registerno]
    );

    // ✅ Check if student existed
    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No student found with this registration number",
      });
    }

    const updatedStudent = updateResult.rows[0];

    return res.status(200).json({
      success: true,
      message: "Student approved successfully",
      student: updatedStudent,
      token, // optional if needed
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
