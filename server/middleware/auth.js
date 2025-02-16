const jwt = require("jsonwebtoken");

// check JWT is valid
function authMiddleware(req, res, next) {
  const token = req.header("Authorization")?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token, authorization denied" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user; // includes id, role, firstName, lastName
    next();
  } catch (err) {
    res.status(401).json({ message: "Token is not valid" });
  }
}

// verify teacher role
function verifyTeacher(req, res, next) {
  if (!req.user || req.user.role !== 'teacher') {
    return res.status(403).json({ message: 'Access denied. Only teachers can perform this action.' });
  }
  next();
}

// verify parent role
function verifyParent(req, res, next) {
  if (!req.user || req.user.role !== 'parent') {
    return res.status(403).json({ message: 'Access denied. Only parents can perform this action.' });
  }
  next();
}

module.exports = {
  authMiddleware,
  verifyTeacher,
  verifyParent
};
