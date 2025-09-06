import supabase from "../database/database.js";

async function fetchstudent(req, res) {
  try {
    // Fetch all students
    const { data, error } = await supabase
      .from("students")
      .select("*");

    console.log(data);

    if (error) {
      console.error("Supabase Fetch Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to fetch students",
        error: error.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Students fetched successfully",
      count: data.length, // number of records
      students: data,     // the actual rows
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

export default fetchstudent;
