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

    // Step 2: Create Supabase Auth user (signup)
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

    // Step 3: Insert into students table (user_id instead of auth_id)
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .insert([
        {
          email,
          name,
          password, // ⚠️ better to hash this before inserting
          user_id: userId, // foreign key to auth.users
          father_guardian_name: "Unknown", // required fields
          dob: "2000-01-01",
          blood_group: null,
          student_contact_number: null,
          parent_guardian_contact_number: "0000000000",
          address: "Not Provided",
          department: "Unknown",
          academic_year: "2025",
          registration_number: "TEMP123",
          roll_number: "TEMP001",
          room_number: 101,
          profile_photo: "default.png",
        },
      ])
      .select();

    if (studentError) {
      return res.status(400).json({
        success: false,
        message: "Failed to insert student data",
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
