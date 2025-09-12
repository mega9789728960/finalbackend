import pool from "../database/database.js";
import jwt from "jsonwebtoken";

async function emailverify(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    // ✅ Combine verification check and update in one query
    const result = await pool.query(
      `UPDATE emailverification
       SET verified = true
       WHERE email = $1 AND verified = false AND code = $2
       RETURNING email`,
      [email, code]
    );

    if (result.rows.length === 0) {
      // Check if email exists at all
      const checkEmail = await pool.query(
        "SELECT verified FROM emailverification WHERE email = $1",
        [email]
      );

      if (checkEmail.rows.length === 0) {
        return res.status(400).json({ success: false, message: "No verification request found for this email" });
      }

      if (checkEmail.rows[0].verified) {
        return res.status(400).json({ success: false, message: "Email already verified" });
      }

      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }
       await pool.query(
    `UPDATE emailverification
     SET registration_expires_at = NOW() + INTERVAL '10 minutes'
     WHERE email = $1`,
    [email]
  );
    


    

    return res.status(200).json({ success: true,message: "Email verified successfully" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default emailverify;
