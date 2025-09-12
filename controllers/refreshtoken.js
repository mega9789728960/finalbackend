import pool from "../database/database.js";
import jwt from "jsonwebtoken";

async function refreshTokenHandler(refreshToken) {
  try {
    if (!refreshToken) {
      return { success: false, message: "No refresh token provided" };
    }

    // ✅ Verify refresh token first (checks signature & expiry)
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || "mysecret");
    } catch (err) {
      console.error("JWT verification failed:", err.message);
      return { success: false, message: "Invalid or expired refresh token" };
    }

    // ✅ Fetch token from DB (only select 'tokens' column)
    const result = await pool.query(
      "SELECT tokens FROM refreshtokens WHERE user_id = $1",
      [decoded.id]
    );

    if (!result.rows.length || result.rows[0].tokens !== refreshToken) {
      // Token not found or mismatch
      return { success: false, message: "Refresh token not valid" };
    }

    // ✅ Issue new access token
    const newAccessToken = jwt.sign(
      { id: decoded.id, email: decoded.email, role: decoded.role },
      process.env.JWT_SECRET || "mysecret",
      { expiresIn: "2m" } // Consider 15m–30m in production
    );

    return { success: true, token: newAccessToken };
  } catch (err) {
    console.error("Refresh handler error:", err);
    return { success: false, message: "Server error" };
  }
}

export default refreshTokenHandler;
