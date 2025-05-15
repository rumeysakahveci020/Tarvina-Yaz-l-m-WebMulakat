const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Lütfen bir kullanıcı adı girin.'],
        unique: true,
        trim: true,
        minlength: [3, 'Kullanıcı adı en az 3 karakter olmalıdır.'],
        maxlength: [20, 'Kullanıcı adı en fazla 20 karakter olabilir.'],
    },
    email: {
        type: String,
        required: [true, 'Lütfen bir e-posta adresi girin.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Lütfen geçerli bir e-posta adresi girin.',
        ],
    },
    password: {
        type: String,
        required: [true, 'Lütfen bir şifre girin.'],
        minlength: [6, 'Şifre en az 6 karakter olmalıdır.'],
        select: false, // Sorgularda varsayılan olarak şifreyi getirme
    },
    profile: {
        bio: { type: String, default: '', maxlength: 200 },
        avatarUrl: { type: String, default: '' }, // Varsayılan bir avatar URL'i olabilir
    },
    level: {
        type: String,
        enum: ['Çaylak Kalem', 'Köşe Yazarı', 'Usta Kalem'], // Seviye isimleri güncellendi
        default: 'Çaylak Kalem'
    },
    postsCount: {
        type: Number,
        default: 0
    },
    battleWinsCount: { // Yazılarının kazandığı karşılaşma sayısı
        type: Number,
        default: 0
    },
    // role: { type: String, enum: ['user', 'admin'], default: 'user' } // Admin yetkilendirmesi için
}, { timestamps: true });

// Şifreyi kaydetmeden önce hash'le
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Girilen şifre ile DB'deki şifreyi karşılaştır
UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Kullanıcı seviyesini güncelleme metodu
UserSchema.methods.updateLevel = async function() {
    let newLevel = 'Çaylak Kalem'; // Varsayılan seviye
    // Kriterler:
    const KOSE_YAZARI_POSTS = 5;
    const KOSE_YAZARI_WINS = 1;
    const USTA_KALEM_POSTS = 15;
    const USTA_KALEM_WINS = 5;

    if (this.postsCount >= USTA_KALEM_POSTS && this.battleWinsCount >= USTA_KALEM_WINS) {
        newLevel = 'Usta Kalem';
    } else if (this.postsCount >= KOSE_YAZARI_POSTS && this.battleWinsCount >= KOSE_YAZARI_WINS) {
        newLevel = 'Köşe Yazarı';
    }

    if (this.level !== newLevel) {
        this.level = newLevel;
        // Bu metodun çağrıldığı yerde save() işlemi yapılmalı veya doğrudan DB update edilmeli.
        // await this.save(); // Sonsuz döngü riski taşır, dikkat!
    }
};

module.exports = mongoose.model('User', UserSchema);