import pool from "../database/database.js";

async function emailpush(req, res) {
  try {
  
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required" });
    }

   const result = await pool.query(
  `SELECT 1
   FROM emailverification
   WHERE email = $1
     AND registration_expires_at > NOW()`,
  [email]
);

if (result.rows.length > 0) {
    return res.json({success:false,message:"wait for 10 minutes"})
} 


    // ✅ Fetch only necessary columns
    const [verificationResult, studentResult] = await Promise.all([
      pool.query("SELECT verified  FROM emailverification WHERE email = $1", [email]),
      pool.query("SELECT 1 FROM students WHERE email = $1", [email])
    ]);

    const isVerified = verificationResult.rows.length > 0 ? verificationResult.rows[0].verified : false;
    const isRegistered = studentResult.rows.length > 0;

    // ✅ Case 1: Already registered
    if (isRegistered) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
        data: { email },
      });
    }

    // ✅ Case 2: Exists in verification but pending
    if (verificationResult.rows.length > 0 && !isVerified) {
      return res.status(200).json({
        success: true,
        message: "Email already exists, pending verification",
        data: { email },
      });
    }

    // ✅ Case 3: Verified but not registered → reset verification
    if (isVerified) {
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

    // ✅ Case 4: Insert new email into emailverification (UPSERT)
    await pool.query(
      `INSERT INTO emailverification (email, verified) 
       VALUES ($1, false)
       ON CONFLICT (email) DO NOTHING`,
      [email]
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
