import supabase from "../database/database.js";

async function registeration(req, res) {
  try {
    const { email, password, name } = req.body;

    // ✅ Step 0: Check if email already exists in students table
    const { data: existingUser, error: existingError } = await supabase
      .from("students")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existingError) {
      return res.status(400).json({
        success: false,
        message: "Something went wrong while checking the email",
        error: existingError.message,
      });
    }

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

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

    // Step 2: Create user account in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) {
      // ✅ Handle duplicate email case from Supabase Auth
      if (authError.message.includes("User already registered")) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Account creation failed. Please try again later.",
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
      // ❌ Rollback user account
      await supabase.auth.admin.deleteUser(userId);

      return res.status(400).json({
        success: false,
        message: "Failed to save student details. Account removed.",
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
