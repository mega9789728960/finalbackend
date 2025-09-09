import pool from "../database/database.js";
import bcrypt from "bcrypt"; // ✅ npm install bcrypt

async function registeration(req, res) {
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

    // ✅ Step 0: Check if email already exists in students table
    const existingUserResult = await pool.query(
      "SELECT id FROM students WHERE email = $1 LIMIT 1",
      [email]
    );
    if (existingUserResult.rows.length > 0) {
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

    if (!verificationData) {
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

    // ✅ Step 2: Hash password
    const hashedPassword = await bcrypt.hash(password, 10); // saltRounds = 10

    // ✅ Step 3: Insert into students table
    const studentResult = await pool.query(
      `INSERT INTO students 
      (email, password, name, father_guardian_name, dob, blood_group, student_contact_number, parent_guardian_contact_number, address, department, academic_year, registration_number, roll_number, room_number, profile_photo) 
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) 
      RETURNING *`,
      [
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
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: studentResult.rows[0],
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

export default registeration;
