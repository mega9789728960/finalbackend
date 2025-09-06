import supabase from "../database/database.js";
import nodemailer from "nodemailer";

async function sendcode(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    // Fetch the verification code from Supabase
    const { data, error } = await supabase
      .from("emailverification")
      .select("code").eq("email",email);

      console.log(data)

    if (error) {
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, message: "No verification request found for this email" });
    }

    const code = data[0].code; // ✅ access the code property
    console.log("Fetched code:", code);

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "benmega500@gmail.com",
        pass: "xsozotdvwyrqpgiu" // Gmail app password
      }
    });

    const mailOptions = {
      from: "benmega500@gmail.com",
      to: email,
      subject: "Your Verification Code",
      text: `Your verification code is: ${code}`
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, message: "Verification code sent to email" });

  } catch (err) {
    console.error("Error sending code:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default sendcode;
