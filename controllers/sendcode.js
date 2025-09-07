import supabase from "../database/database.js";
import nodemailer from "nodemailer";

async function sendcode(req, res) {
  try {
    const { email } = req.body;

    // ✅ Validate email
    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // ✅ Fetch latest verification record
    const { data, error } = await supabase
      .from("emailverification")
      .select("code, expires_at")
      .eq("email", email)
      .order("expires_at", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "No verification request found for this email" });
    }

    let code = data[0].code;
    const now = Date.now();

    // ✅ Handle existing verification
    if (data[0].expires_at) {
      const expire = new Date(data[0].expires_at).getTime();
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

    await supabase
      .from("emailverification")
      .update({ code, expires_at: newExpire })
      .eq("email", email);

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
