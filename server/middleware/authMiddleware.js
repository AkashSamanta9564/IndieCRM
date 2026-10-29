const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      issuer: "indiecrm",
      audience: "indiecrm-client",
    });
    const user = await User.findById(decoded.id).select("_id").lean();

    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token." });
    }

    req.user = { id: user._id.toString() };
    next();
  } catch {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
};

module.exports = authMiddleware;
