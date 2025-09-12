import pool from "../database/database.js";
import nodemailer from "nodemailer";


async function sendcode(req, res) {
  try {
    const { email } = req.body;

    // ✅ Validate email early
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // ✅ Fetch latest verification record (only required fields)
    const { rows } = await pool.query(
      "SELECT code, expires_at FROM emailverification WHERE email = $1 ORDER BY expires_at DESC LIMIT 1",
      [email]
    );

    const now = Date.now();
    let code;

    if (rows.length > 0) {
      const { code: existingCode, expires_at } = rows[0];

      // ✅ If current OTP is still valid, return without sending a new one
      if (expires_at && new Date(expires_at).getTime() > now) {
        return res.status(200).json({
          success: true,
          message: "OTP still valid, not expired yet",
          expiringtime: new Date(expires_at).toISOString()
        });
      }
    }

    // ✅ Generate new 6-digit OTP
    code = Math.floor(100000 + Math.random() * 900000);
    console.log("Generated new code:", code);

    // ✅ Setup email transporter with hardcoded credentials
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "benmega500@gmail.com",
        pass: "xsozotdvwyrqpgiu"
      }
    });

    const mailOptions = {
      from: "benmega500@gmail.com",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`
    };

    await transporter.sendMail(mailOptions);

    // ✅ Set expiry time 1 minute from now
    const newExpire = new Date(now + 1 * 60 * 1000).toISOString();

    // ✅ Update or insert verification record (upsert pattern)
    await pool.query(
      `INSERT INTO emailverification (email, code, expires_at)
       VALUES ($1, $2, $3)
       ON CONFLICT (email)
       DO UPDATE SET code = EXCLUDED.code, expires_at = EXCLUDED.expires_at`,
      [email, code, newExpire]
    );
    



    

    return res.status(200).json({
      success: true,
      message: "Verification code sent to email",
      codeSent: true,
      
    });

  } catch (err) {
    console.error("Error sending code:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default sendcode;
