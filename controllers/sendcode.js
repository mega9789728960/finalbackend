import pool from "../database/database.js";
import nodemailer from "nodemailer";

async function sendcode(req, res) {
  try {
    const { email } = req.body;

    // ✅ Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // ✅ Fetch latest verification record (order by expires_at desc, limit 1)
    const result = await pool.query(
      "SELECT code, expires_at FROM emailverification WHERE email = $1 ORDER BY expires_at DESC LIMIT 1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "No verification request found for this email" });
    }

    let code = result.rows[0].code;
    const now = Date.now();

    // ✅ Handle existing verification
    if (result.rows[0].expires_at) {
      const expire = new Date(result.rows[0].expires_at).getTime();
      const expireString = new Date(expire).toISOString();

      if (now < expire) {
        return res.status(200).json({
          success: true,
          message: "OTP still valid, not expired yet",
          expiringtime: expireString
        });
      }
    }

    // ✅ Generate new OTP (6 digits)
    code = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated new code:", code);

    // ✅ Setup email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER || "benmega500@gmail.com",
        pass: process.env.EMAIL_PASS || "xsozotdvwyrqpgiu"
      }
    });

    const mailOptions = {
      from: "benmega500@gmail.com",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`
    };

    await transporter.sendMail(mailOptions);

    // ✅ Set new expiry time (1 minute)
    const newExpire = new Date(now + 1 * 60 * 1000).toISOString();

    await pool.query(
      "UPDATE emailverification SET code = $1, expires_at = $2 WHERE email = $3",
      [code, newExpire, email]
    );

    return res.status(200).json({
      success: true,
      message: "Verification code sent to email"
    });

  } catch (err) {
    console.error("Error sending code:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default sendcode;
