const mongoose = require('mongoose');

const BattleSchema = new mongoose.Schema({
    post1: { // Karşılaşan ilk yazı
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true,
    },
    post2: { // Karşılaşan ikinci yazı
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true,
    },
    category: { // Karşılaşmanın yapıldığı kategori
        type: String,
    },
    status: { // Karşılaşmanın durumu
        type: String,
        enum: ['baslangic_bekleniyor', 'aktif', 'oylama_kapandi', 'tamamlandi', 'iptal_edildi'],
        default: 'aktif',
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: { // Oylamanın bitiş zamanı (opsiyonel)
        type: Date,
    },
    votesPost1: {
        type: Number,
        default: 0,
    },
    votesPost2: {
        type: Number,
        default: 0,
    },
    winner: { // Kazanan yazı (tamamlandığında)
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        default: null,
    },
    round: { // Turnuvanın hangi turunda olduğu
        type: Number,
        default: 1,
    },
}, { timestamps: true });

// Aynı iki yazının eşleşmesini engelle
BattleSchema.pre('save', function(next) {
    if (this.isNew && this.post1.toString() === this.post2.toString()) {
        const err = new Error('İki aynı yazı birbiriyle karşılaşamaz.');
        return next(err);
    }
    next();
});

// Karşılaşma kaydedildikten sonra ilgili yazıların ve yazarların durumunu güncelle
BattleSchema.post('save', async function(doc, next) {
    const Post = mongoose.model('Post');
    const User = mongoose.model('User');

    try {
        // Yeni ve aktif bir karşılaşma ise yazıların durumunu güncelle
        if (doc.isNew && doc.status === 'aktif') {
            await Post.updateMany(
                { _id: { $in: [doc.post1, doc.post2] } },
                { $set: { status: 'karsilasmada', currentBattleId: doc._id } }
            );
        }

        // Karşılaşma tamamlandıysa ve kazanan varsa
        if (!doc.isNew && doc.isModified('status') && doc.status === 'tamamlandi' && doc.winner) {
            const winnerPost = await Post.findById(doc.winner);
            const loserId = doc.post1.toString() === doc.winner.toString() ? doc.post2 : doc.post1;

            // Kaybeden yazının durumunu güncelle
            await Post.findByIdAndUpdate(loserId, { $set: { status: 'yayinda', currentBattleId: null }});

            // Kazanan yazının ve yazarının bilgilerini güncelle
            if (winnerPost) {
                winnerPost.battleWins = (winnerPost.battleWins || 0) + 1;
                winnerPost.status = 'yayinda'; // Bir sonraki tur için hazır
                winnerPost.currentBattleId = null;
                await winnerPost.save({ validateBeforeSave: false });

                const author = await User.findById(winnerPost.author);
                if (author) {
                    author.battleWinsCount = (author.battleWinsCount || 0) + 1;
                    await author.updateLevel();
                    await author.save({ validateBeforeSave: false });
                }
            }
        }
        next();
    } catch (error) {
        console.error("Battle save sonrası post/kullanıcı güncelleme hatası:", error);
        // Hata durumunda next(error) çağrılabilir, ancak istemciye çift yanıt gitmesini engellemek için dikkatli olunmalı.
    }
});

module.exports = mongoose.model('Battle', BattleSchema);