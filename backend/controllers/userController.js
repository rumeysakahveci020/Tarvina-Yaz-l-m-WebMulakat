const User = require('../models/User');
const Post = require('../models/Post');
const mongoose = require('mongoose');

// @desc    ID ile kullanıcı profilini getir (Herkese Açık)
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error('Geçersiz kullanıcı ID formatı.');
        }
        const user = await User.findById(req.params.id).select('-password'); // Şifreyi hariç tut

        if (!user) {
            res.status(404);
            throw new Error('Kullanıcı bulunamadı.');
        }

        // Kullanıcının yazılarını da getirebiliriz (opsiyonel, sayfalama eklenebilir)
        const posts = await Post.find({ author: user._id, status: 'yayinda' })
            .sort({ createdAt: -1 })
            .limit(10) // Son 10 yazı
            .select('title excerpt createdAt');

        res.json({ user, posts });
    } catch (error) {
        next(error);
    }
};

// @desc    Giriş yapmış kullanıcının profilini güncelle
// @route   PUT /api/users/profile (veya /api/auth/me/update)
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id); // protect middleware'inden gelir

        if (!user) {
            res.status(404);
            throw new Error('Kullanıcı bulunamadı.');
        }

        // Sadece belirli alanların güncellenmesine izin ver
        user.username = req.body.username || user.username;
        user.email = req.body.email || user.email; // E-posta değişikliği için ek doğrulama gerekebilir
        if (req.body.profile) {
            user.profile.bio = req.body.profile.bio || user.profile.bio;
            user.profile.avatarUrl = req.body.profile.avatarUrl || user.profile.avatarUrl;
        }

        // Şifre güncelleme ayrı bir endpoint'te yapılmalı veya özel kontrol ile
        if (req.body.password) {
            // Eski şifre kontrolü ve yeni şifre hash'leme
            // user.password = req.body.password; // Bu şekilde direkt atama yapılmamalı!
            res.status(400); // Şimdilik bu endpoint şifre güncellemez
            throw new Error('Şifre güncelleme için lütfen ilgili endpoint\'i kullanın.');
        }

        const updatedUser = await user.save(); // Bu, pre-save hook'larını tetikleyebilir (şifre gibi)

        res.json({
            _id: updatedUser._id,
            username: updatedUser.username,
            email: updatedUser.email,
            profile: updatedUser.profile,
            level: updatedUser.level,
            token: generateToken(updatedUser._id), // Token'ı yenilemek iyi bir pratik olabilir
        });

    } catch (error) {
        if (error.name === 'ValidationError' || error.code === 11000) { // Unique alan hatası
             res.status(400);
        }
        next(error);
    }
};