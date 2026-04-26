export const adminMiddleware = (req, res, next) => {
    if (req.user && (req.user.role === 'admin' || req.user.email === 'ujjwalprakashrc11.22@gmail.com')) {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admin only." });
    }
};

export const superAdminMiddleware = (req, res, next) => {
    if (req.user && req.user.email === 'ujjwalprakashrc11.22@gmail.com') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Super Admin only." });
    }
};
