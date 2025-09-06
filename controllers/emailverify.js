import supabase from "../database/database.js";

async function emailverify(req, res) {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    // Fetch the OTP for the email
    const { data, error } = await supabase
      .from("emailverification")
      .select("code, verified")
      .eq("email", email)
      .limit(1)
      .single(); // get only one row

    if (error && error.code !== "PGRST116") { // ignore "No rows found" error for single()
      return res.status(500).json({ success: false, message: error.message });
    }

    if (!data) {
      return res.status(400).json({ success: false, message: "No verification request found for this email" });
    }

    if (data.verified) {
      return res.status(400).json({ success: false, message: "Email already verified" });
    }

    if (data.code !== code) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    // Update the verified flag
    const { data: updateData, error: updateError } = await supabase
      .from("emailverification")
      .update({ verified: true })
      .eq("email", email);

    if (updateError) {
      return res.status(500).json({ success: false, message: updateError.message });
    }

    return res.status(200).json({ success: true, message: "Email verified successfully" });

  } catch (err) {
    console.error("Server error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
}

export default emailverify;
