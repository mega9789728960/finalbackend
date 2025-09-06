import supabase from "../database/database.js";

async function approve(req, res) {
  try {
    const { registerno } = req.body;

    // Validate input
    if (!registerno) {
      return res.status(400).json({
        success: false,
        message: "Registration number is required",
      });
    }

    // Update student status
    console.log(await supabase.from("students").select("*").eq("registration_number",registerno));
    const { data, error } = await supabase
      .from("students")
      .update({ status: "active" })
      .eq("registration_number", registerno)
      .select(); // return updated row

    if (error) {
      console.error("Supabase Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to approve student",
        error: error.message,
      });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No student found with this registration number",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student approved successfully",
      student: data[0],
    });
  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

export default approve;
