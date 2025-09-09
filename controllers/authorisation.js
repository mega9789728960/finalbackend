import jwt from "jsonwebtoken";

function authorisation(req, res, next) {
  // Get token from body or headers
  const token = req.body.token || req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ success: false, error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, "mysecret"); // Replace "mysecret" with env variable

    if (decoded.role === "admin") {
      req.user = decoded; // optional: save decoded info for later use
      next(); // pass control to next middleware
    } else {
      return res.status(403).json({ success: false, error: "Incorrect token" });
    }

  } catch (err) {
    return res.status(403).json({ success: false, error: "Invalid or expired token" });
  }
}

export default authorisation;
