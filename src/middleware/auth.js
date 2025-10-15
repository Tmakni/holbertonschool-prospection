import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme_very_secret';

export const authMiddleware = (req, res, next) => {
    const checkPath = req.originalUrl || req.path;
    console.log('Auth check for ' + req.method + ' ' + checkPath);

    const token = req.cookies.token;
    
    if (!token) {
        console.log('No token found, redirecting to login');
        return res.redirect('/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        console.log('Auth success for user:', decoded.email);
        next();
    } catch (err) {
        console.error('Token invalid:', err.message);
        res.clearCookie('token');
        return res.redirect('/login');
    }
};
