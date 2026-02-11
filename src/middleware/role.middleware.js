const roleMiddleware = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !req.user.role) {
            return res.status(401).json({ msg: "Unauthorized" });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({
                msg: `Role (${req.user.role}) is not allowed to access this resource`
            });
        }

        next();
    };
};

module.exports = roleMiddleware;
