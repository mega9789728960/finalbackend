import supabase from "../database/database.js";

async function emailpush(req, res) {
  try {
    const { email } = req.body;

    // ✅ Validate first
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // ✅ Check if already in student table
    const { data: alreadyInRegister, error: studentError } = await supabase
      .from("students")
      .select("id")
      .eq("email", email);

    if (studentError) {
      console.error("Supabase Student Fetch Error:", studentError.message);
      return res.status(500).json({ success: false, error: studentError.message });
    }

    if (alreadyInRegister.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
        data: { email },
      });
    }

    // ✅ Check if email exists in emailverification
    const { data: already, error: fetchError } = await supabase
      .from("emailverification")
      .select("verified")
      .eq("email", email);

    if (fetchError) {
      console.error("Supabase Fetch Error:", fetchError.message);
      return res.status(500).json({ success: false, error: fetchError.message });
    }

    if (already.length > 0) {
      const verified = already[0].verified;

      if (!verified) {
        return res.status(200).json({
          success: true,
          message: "Email already exists, pending verification",
          data: { email },
        });
      }

      return res.status(409).json({
        success: false,
        message: "Email already verified",
        data: { email },
      });
    }

    // ✅ Insert new row
    const { error: insertError } = await supabase
      .from("emailverification")
      .insert([{ email }]);

    if (insertError) {
      if (insertError.code === "23505") { // unique_violation
        return res.status(409).json({ success: false, error: "Email already exists" });
      }
      console.error("Supabase Insert Error:", insertError.message);
      return res.status(500).json({ success: false, error: insertError.message });
    }

    return res.status(201).json({
      success: true,
      message: "Email record initialized, waiting for verification code",
      data: { email },
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

export default emailpush;
