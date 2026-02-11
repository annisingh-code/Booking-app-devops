const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ msg: "Authorization header missing" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ msg: "Token missing" });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        req.user = decoded; // { userId, role, iat, exp }

        next();
    } catch (error) {
        return res.status(401).json({ msg: "Invalid or expired token" });
    }
};

module.exports = authMiddleware;
