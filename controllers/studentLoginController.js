import pool from "../database/database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function studentLoginController(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Email and password are required" });
    }

    // Check if student exists
   const result = await pool.query(
  "SELECT id, email, password, name FROM students WHERE email = $1",
  [email]
);

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({ success: false, error: "No student found with this email" });
    }

    // Validate password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ success: false, error: "Invalid password" });
    }

    // Generate tokens
    const token = jwt.sign(
      { id: user.id, email: user.email, role: "student" },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "2m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id, email: user.email, role: "student" },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "7d" }
    );

    // Save refresh token
    await pool.query(
      `INSERT INTO refreshtokens (user_id, tokens, expires_at)
       VALUES ($1, $2, NOW() + interval '7 days')
       ON CONFLICT (user_id)
       DO UPDATE SET tokens = EXCLUDED.tokens, expires_at = EXCLUDED.expires_at`,
      [user.id, refreshToken]
    );

    const { password:password1, ...userData } = user;



    // Store in cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({
      success: true,
      message: "Student login successful",
      token,
      role: "student",
      data: userData,
    });
  } catch (err) {
    console.error("Student login error:", err);
    return res.status(500).json({ success: false, error: "Server error" });
  }
}

export default studentLoginController;