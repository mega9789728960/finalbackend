import pool from "../database/database.js";

async function emailverify(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    // ✅ Fetch the OTP for the email
    const result = await pool.query(
      "SELECT code, verified FROM emailverification WHERE email = $1 LIMIT 1",
      [email]
    );

    const data = result.rows[0]; // get first row

    if (!data) {
      return res.status(400).json({ success: false, message: "No verification request found for this email" });
    }

    if (data.verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (data.code !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // ✅ Update the verified flag
    await pool.query(
      "UPDATE emailverification SET verified = true WHERE email = $1",
      [email]
    );

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default emailverify;
