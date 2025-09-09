import pool from "../database/database.js";
import bcrypt from "bcrypt"; // for password checking
import jwt from "jsonwebtoken"; // optional, for session tokens

export async function loginController(req, res) {
  try {
    const { email, password } = req.body;
    

    // 1️⃣ Validate input
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // 2️⃣ Check if user exists in students table
    const studentResult = await pool.query(
      "SELECT * FROM students WHERE email = $1",
      [email]
    );

    let user = studentResult.rows[0];
    let role = "student";

    // 3️⃣ If not found in students, check admins
    if (!user) {
      const adminResult = await pool.query(
        "SELECT * FROM admins WHERE email = $1",
        [email]
      );
      user = adminResult.rows[0];
      role = "admin";
    }

    // 4️⃣ If user not found in either table
    if (!user) {
      return res.status(404).json({ success: false, error: "No user found with this email" });
    }

    // 5️⃣ Compare password (assuming stored as hashed)
    const validPassword = bcrypt.hash(password,user.password,10) ;
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }

    // 6️⃣ Generate JWT token (optional)
    const token = jwt.sign(
      { id: user.id, email: user.email, role },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "1h" }
    );

    // 7️⃣ If student, return only student data
    if (role === "student") {
      return res.status(200).json({
        success: true,
        message: "Login successful",
        token,
        role,
        data: user
      });
    }

    // 8️⃣ If admin, fetch all students as extra data
    const studentsResult = await pool.query("SELECT * FROM students");
    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      token,
      role,
      data: user,
      studentsdata: studentsResult.rows
    });

  } catch (err) {
    console.error("Unexpected error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export default loginController;
