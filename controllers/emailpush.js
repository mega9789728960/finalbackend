import supabase from "../database/database.js";

async function emailpush(req, res) {
  try {
    const { email } = req.body;

    // Basic validation
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // OTP generator
    function generateNumericCode(length = 6) {
      let code = "";
      for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
      }
      return code;
    }

    const code = generateNumericCode();

    // Insert into Supabase
    const { data, error } = await supabase
      .from("emailverification")
      .insert([{ email, code }]);

    if (error) {
      // ✅ Custom handling for duplicate email constraint
      if (error.code === "23505") {
        return res.status(200).json({
          success: false,
          exist: true,
          message: "Email already exists in verification table",
        });
      }

      // Keep existing exception handling
      console.error("Supabase Insert Error:", error.message);
      return res.status(500).json({ success: false, error: error.message });
    }

    return res.status(201).json({
      success: true,
      message: "Verification code generated and stored",
      data: { email, code }, // ⚠️ remove `code` here in production
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

export default emailpush;
