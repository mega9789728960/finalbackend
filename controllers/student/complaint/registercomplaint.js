import pool from "../../../database/database.js";

async function registercomplaint(req, res) {
  try {
    const { id: student_id, title, description, category, priority } = req.body;

    const result = await pool.query(
      `INSERT INTO complaints (student_id, title, description, category, priority)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,  // return the inserted row
      [student_id, title, description, category, priority]
    );

    if (result.rowCount === 0) {
      return res.status(400).json({ success: false, message: "Complaint not registered" });
    }

    return res.json({
      success: true,
      message: "Complaint registered successfully",
      complaint: result.rows[0], // send back inserted complaint
    });

  } catch (err) {
    console.error("Error registering complaint:", err.message);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default registercomplaint;
