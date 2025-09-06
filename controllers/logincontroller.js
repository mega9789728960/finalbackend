import supabase from "../database/database.js";

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // 2️⃣ Authenticate user with Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return res.status(401).json({ success: false, error: authError.message });
    }

    const session = authData.session;
    const user = authData.user;

    if (!user) {
      return res.status(401).json({ success: false, error: "Authentication failed" });
    }

    const user_id = user.id;
    console.log("User ID:", user_id);

    // 3️⃣ Fetch student data
    const { data: studentData, error: studentError } = await supabase
      .from("students")
      .select("*")
      .eq("user_id", user_id);

    if (studentError) {
      console.error("Supabase query error:", studentError.message);
      return res.status(500).json({ success: false, error: "Failed to fetch student data" });
    }

    // 4️⃣ Check if student data exists
    if (studentData && studentData.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        session,
        data: studentData[0],
        role:"student"
      });
    }

    // 5️⃣ If student not found, try admin table
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("*")
      .eq("user_id", user_id);

    if (adminError) {
      console.error("Supabase admin query error:", adminError.message);
      return res.status(500).json({ success: false, error: "Failed to fetch admin data" });
    }

    const {data:studentData1,error:studentError1}=await supabase.from("students").select("*");

    if (adminData && adminData.length > 0) {
      return res.status(200).json({
        success: true,
        message: "Admin login successful",
        session,
        data: adminData[0],
        role: "admin",
        studentsdata:studentData1

      });
    }

    // 6️⃣ If neither student nor admin found
    return res.status(404).json({ success: false, error: "No user found with this email" });

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export default loginController;
