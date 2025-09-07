import supabase from "../database/database.js";

async function registeration(req, res) {
  try {
    const { email, password, name } = req.body;

    // Step 1: Check verification status
    const { data: verificationData, error: verificationError } = await supabase
      .from("emailverification")
      .select("verified")
      .eq("email", email)
      .single();

    if (verificationError || !verificationData) {
      return res.status(400).json({
        success: false,
        message: "No verification found for this email",
      });
    }

    if (verificationData.verified !== true) {
      return res.status(400).json({
        success: false,
        message: "Email is not verified yet",
      });
    }

    // Step 2: Create Supabase Auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      return res.status(400).json({
        success: false,
        message: "Supabase signup failed",
        error: authError.message,
      });
    }

    const userId = authData.user?.id;
    req.body.user_id = userId;

    // Step 3: Insert into students table
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .insert([req.body])
      .select();

    if (studentError) {
      // ❌ Rollback Supabase Auth user
      await supabase.auth.admin.deleteUser(userId);

      return res.status(400).json({
        success: false,
        message: "Failed to insert student data. User account removed.",
        error: studentError.message,
      });
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: studentData[0],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

export default registeration;
