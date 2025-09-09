import pool from "../database/database.js";

async function emailpush(req, res) {
  try {
    const { email } = req.body;

    // ✅ Validate email
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

    // ✅ Fetch emailverification record
    const verificationResult = await pool.query(
      "SELECT * FROM emailverification WHERE email = $1",
      [email]
    );
    const verificationData = verificationResult.rows;
    let verified = verificationData.length > 0 ? verificationData[0].verified : false;

    // ✅ Check if email is already registered in students
    const studentResult = await pool.query(
      "SELECT * FROM students WHERE email = $1",
      [email]
    );
    const studentData = studentResult.rows;

    // ✅ Case 1: Email is verified but not registered
    if (studentData.length === 0 && verified) {
      await pool.query(
        "UPDATE emailverification SET verified = false WHERE email = $1",
        [email]
      );

      return res.status(201).json({
        success: true,
        message: "Email is verified but account not registered, verification reset",
        data: { email },
      });
    }

    // ✅ Case 2: Email is already registered
    if (studentData.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
        data: { email },
      });
    }

    // ✅ Case 3: Email exists in emailverification but not verified
    if (verificationData.length > 0 && !verified) {
      return res.status(200).json({
        success: true,
        message: "Email already exists, pending verification",
        data: { email },
      });
    }

    // ✅ Case 4: Insert new email into emailverification
    await pool.query(
      "INSERT INTO emailverification (email, verified) VALUES ($1, $2)",
      [email, false]
    );

    return res.status(201).json({
      success: true,
      message: "Email record initialized, waiting for verification code",
      data: { email },
    });

  } catch (err) {
    console.error("Server Error:", err);
    return res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

export default emailpush;
