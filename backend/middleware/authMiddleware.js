const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                res.status(401);
                throw new Error('Yetkisiz erişim, kullanıcı bulunamadı.');
            }
            next();
        } catch (error) {
            console.error('Token doğrulama hatası:', error.message);
            res.status(401);
            // Hata mesajını daha genel tutabiliriz
            next(new Error('Yetkisiz erişim, token geçersiz veya süresi dolmuş.'));
        }
    }

    if (!token) {
        res.status(401);
        next(new Error('Yetkisiz erişim, token bulunamadı.'));
    }
};

// Rol bazlı yetkilendirme (Eğer User modelinde 'role' alanı varsa kullanılabilir)
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403); // Forbidden
            throw new Error(`Rol '${req.user ? req.user.role : 'tanımsız'}' bu kaynağa erişim için yetkili değil.`);
        }
        next();
    };
};

module.exports = { protect, authorize };