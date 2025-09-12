import jwt from "jsonwebtoken";
import refreshTokenHandler from "./refreshtoken.js"; // ✅ renamed for clarity

async function authorisation(req, res, next) {
  // 1️⃣ Get tokens
  const token = req.body.token || req.headers["authorization"]?.split(" ")[1];
  const refreshToken = req.cookies.refreshToken;
  console.log(refreshToken);

  if (!token) {
    return res.status(401).json({ success: false, error: "Token missing" });
  }

  try {
    // 2️⃣ Verify access token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "mysecret");

    if (decoded.role === "admin") {
      req.user = decoded;
      return next();
    } else {
      return res.status(403).json({ success: false, error: "Forbidden: not admin" });
    }
  } catch (err) {
    console.log("Access token expired, trying refresh...");

    // 3️⃣ Try refresh token if access expired
    if (!refreshToken) {
      return res.status(403).json({ success: false, error: "No refresh token" });
    }

    const result = await refreshTokenHandler(refreshToken);
    if (result.success) {
      // Set the new token in the request for the next middleware
      req.body.token = result.token;
      // Re-verify the new token to set req.user
      const newDecoded = jwt.verify(result.token, process.env.JWT_SECRET || "mysecret");
      if (newDecoded.role === "admin") {
        req.user = newDecoded;
        return next();
      } else {
        return res.status(403).json({ success: false, error: "Forbidden: not admin" });
      }
    }

    return res.status(403).json({ success: false, error: "Invalid refresh token" });
  }
}

export default authorisation;
