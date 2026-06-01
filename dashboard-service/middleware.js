import jwt from 'jsonwebtoken';

const authenticateToken = (req, res, next) => {
  // Get the token from the 'Authorization' header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: "Access Denied: No Token Provided" });
  }

  try {
    // Verify the token using the secret key
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified; // Add the user data to the request object
    next(); // Move to the next function (the actual route)
  } catch (err) {
    res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

export default authenticateToken;
