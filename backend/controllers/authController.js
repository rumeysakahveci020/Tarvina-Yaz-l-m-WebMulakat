const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// @desc    Yeni kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
exports.registerUser = async (req, res, next) => {
    const { username, email, password } = req.body;
    try {
        const userExists = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
        if (userExists) {
            res.status(400);
            throw new Error('Bu kullanıcı adı veya e-posta zaten kayıtlı.');
        }
        const user = await User.create({ username, email, password });
        if (user) {
            res.status(201).json({
                _id: user._id,
                username: user.username,
                email: user.email,
                level: user.level,
                token: generateToken(user._id),
            });
        } else {
            res.status(400);
            throw new Error('Kullanıcı kaydı oluşturulamadı, geçersiz veri.');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Kullanıcı girişi ve token alma
// @route   POST /api/auth/login
// @access  Public
exports.loginUser = async (req, res, next) => {
    const { email, password } = req.body;
    try {
        if (!email || !password) {
            res.status(400);
            throw new Error('Lütfen e-posta ve şifrenizi girin.');
        }
        const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                level: user.level,
                token: generateToken(user._id),
            });
        } else {
            res.status(401); // Yetkisiz
            throw new Error('Geçersiz e-posta veya şifre.');
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Giriş yapmış kullanıcının profilini getir
// @route   GET /api/auth/me
// @access  Private (protect middleware'i ile korunuyor)
exports.getMe = async (req, res, next) => {
    try {
        // req.user, protect middleware'inden geliyor olmalı
        const user = await User.findById(req.user.id).select('-password'); // Şifreyi hariç tut
        if (user) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                profile: user.profile,
                level: user.level,
                postsCount: user.postsCount,
                battleWinsCount: user.battleWinsCount
            });
        } else {
            res.status(404);
            throw new Error('Kullanıcı bulunamadı.');
        }
    } catch (error) {
        next(error);
    }
};