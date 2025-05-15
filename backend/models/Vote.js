const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    battle: { // Hangi karşılaşma için oy verildiği
        type: mongoose.Schema.ObjectId,
        ref: 'Battle',
        required: true,
    },
    user: { // Oy veren kullanıcı
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    votedForPost: { // Hangi yazıya oy verildiği
        type: mongoose.Schema.ObjectId,
        ref: 'Post',
        required: true,
    }
}, { timestamps: true });

// Bir kullanıcının aynı karşılaşmaya birden fazla oy vermesini engelle
VoteSchema.index({ battle: 1, user: 1 }, { unique: true });

// Oy kaydedildikten sonra Battle modelindeki oy sayılarını güncelle
VoteSchema.post('save', async function(doc, next) {
    try {
        const battle = await mongoose.model('Battle').findById(doc.battle);
        if (!battle) {
            // Hata loglanabilir, ama next() ile devam et ki oy kaydedilsin.
            // Ya da next(new Error(...)) ile hata fırlatılabilir.
            console.warn(`Oy kaydedildi ama ilgili karşılaşma bulunamadı: Battle ID ${doc.battle}`);
            return next();
        }

        const updateField = doc.votedForPost.toString() === battle.post1.toString() ? 'votesPost1' : 'votesPost2';
        
        await mongoose.model('Battle').updateOne(
            { _id: doc.battle },
            { $inc: { [updateField]: 1 } }
        );
        next();
    } catch (error) {
        console.error("Vote save sonrası karşılaşma oy güncelleme hatası:", error);
        // Hata durumunda next(error) çağrılabilir.
    }
});

module.exports = mongoose.model('Vote', VoteSchema);