import jwt from "jsonwebtoken";
import jwksRsa from "jwks-rsa";

// Middleware to verify the JWT
const verifyUser = (req, res, next) => {
  console.log(req);
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized: No token provided" });
  }
  const auth0Domain = "dev-ye6rboqfch0cwuik.us.auth0.com"; // e.g., "your-domain.auth0.com"
  const audience = "https://api.preemly.eu";
  const client = jwksRsa({
    jwksUri: `https://${auth0Domain}/.well-known/jwks.json`,
  });

  const getSigningKey = (header, callback) => {
    client.getSigningKey(header.kid, (err, key) => {
      if (err) {
        console.error("Error getting signing key:", err);
        return callback(err);
      }
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    });
  };

  jwt.verify(
    token,
    getSigningKey,
    {
      audience: audience,
      issuer: `https://${auth0Domain}/`,
      algorithms: ["RS256"],
    },
    (err, decoded) => {
      if (err) {
        console.error("JWT verification failed:", err);
        return res
          .status(401)
          .json({ success: false, message: "Unauthorized: Invalid token" });
      }
      console.log("Decoded JWT:", decoded); // Debugging
      req.user = decoded; // Attach user info to the request
      next();
    }
  );
};

export default verifyUser;
