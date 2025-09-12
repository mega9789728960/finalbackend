import pool from "../database/database.js";
import bcrypt from "bcrypt";

async function registration(req, res) {
  try {
    const {
      email,
      password,
      name,
      father_guardian_name,
      dob,
      blood_group,
      student_contact_number,
      parent_guardian_contact_number,
      address,
      department,
      academic_year,
      registration_number,
      roll_number,
      room_number,
      profile_photo
    } = req.body;

    // ✅ Validate required fields upfront
    if (!email || !password || !name || !registration_number) {
      return res.status(400).json({
        success: false,
        message: "Email, password, name, and registration number are required",
      });
    }

    // ✅ Step 0: Check if email already exists
    const existingUser = await pool.query(
      "SELECT id FROM students WHERE email = $1 LIMIT 1",
      [email]
    );
    if (existingUser.rows.length) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // ✅ Step 1: Check verification status
    const verificationResult = await pool.query(
      "SELECT verified FROM emailverification WHERE email = $1 LIMIT 1",
      [email]
    );
    const verificationData = verificationResult.rows[0];

    if (!verificationData || !verificationData.verified) {
      return res.status(400).json({
        success: false,
        message: verificationData ? "Email is not verified yet" : "No verification found for this email",
      });
    }

    // ✅ Step 2: Hash password asynchronously
    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds = 10

    // ✅ Step 3: Insert into students table (return only necessary columns)
    const insertQuery = `
      INSERT INTO students 
      (email, password, name, father_guardian_name, dob, blood_group, student_contact_number, parent_guardian_contact_number, address, department, academic_year, registration_number, roll_number, room_number, profile_photo) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) 
      RETURNING id, email, name, registration_number, department, academic_year
    `;

    const studentResult = await pool.query(insertQuery, [
      email,
      hashedPassword,
      name,
      father_guardian_name,
      dob,
      blood_group,
      student_contact_number,
      parent_guardian_contact_number,
      address,
      department,
      academic_year,
      registration_number,
      roll_number,
      room_number,
      profile_photo,
    ]);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: studentResult.rows[0],
    });

  } catch (err) {
    console.error("Registration Error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: err.message,
    });
  }
}

export default registration;
