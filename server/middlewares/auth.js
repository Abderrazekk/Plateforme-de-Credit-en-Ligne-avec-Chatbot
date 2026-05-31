import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      // Inside the try block of the protect middleware:
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        res.status(401);
        throw new Error("Non autorisé, utilisateur non trouvé");
      }

      // NEW: Kick user if they were banned while logged in
      if (req.user.isBanned) {
        res.status(403);
        throw new Error("Accès refusé. Votre compte a été suspendu.");
      }

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Non autorisé, token invalide");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Non autorisé, aucun token fourni");
  }
};

export default protect;
