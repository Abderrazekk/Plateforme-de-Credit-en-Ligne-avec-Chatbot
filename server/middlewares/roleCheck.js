const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        `Rôle '${req.user.role}' non autorisé à accéder à cette ressource`
      );
    }
    next();
  };
};

export default authorize;