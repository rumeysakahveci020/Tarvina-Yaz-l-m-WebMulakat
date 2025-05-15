const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Lütfen bir başlık girin.'],
        trim: true,
        minlength: [5, 'Başlık en az 5 karakter olmalıdır.'],
        maxlength: [100, 'Başlık en fazla 100 karakter olabilir.'],
    },
    content: {
        type: String,
        required: [true, 'Lütfen içerik girin.'],
        minlength: [50, 'İçerik en az 50 karakter olmalıdır.'],
    },
    excerpt: { // Kısa özet
        type: String,
        required: [true, 'Lütfen bir özet girin.'],
        minlength: [10, 'Özet en az 10 karakter olmalıdır.'],
        maxlength: [250, 'Özet en fazla 250 karakter olabilir.'],
    },
    imageUrl: {
        type: String, // Görsel URL'i
        default: '',
    },
    category: {
        type: String,
        required: [true, 'Lütfen bir kategori seçin.'],
        // enum: ['Teknoloji', 'Gezi', 'Yemek', 'Sanat', 'Edebiyat', 'Yaşam', 'Diğer'] // Örnek kategoriler
    },
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    status: { // Yazının durumu
        type: String,
        enum: ['taslak', 'yayinda', 'karsilasmada', 'arsivlendi'],
        default: 'yayinda', // Varsayılan olarak yayınlansın
    },
    battleWins: { // Bu yazının kazandığı karşılaşma sayısı
        type: Number,
        default: 0
    },
    currentBattleId: { // Yazı bir karşılaşmadaysa, o karşılaşmanın ID'si
        type: mongoose.Schema.ObjectId,
        ref: 'Battle',
        default: null
    },
}, { timestamps: true });

// Yazı kaydedildikten sonra yazarın yazı sayısını ve seviyesini güncelle
PostSchema.post('save', async function(doc, next) {
    if (doc.isNew && doc.status === 'yayinda') { // Sadece yeni ve yayınlanmış yazılar için
        try {
            const author = await mongoose.model('User').findById(doc.author);
            if (author) {
                author.postsCount = (author.postsCount || 0) + 1;
                await author.updateLevel(); // Seviye kontrolü
                await author.save({ validateBeforeSave: false }); // Sadece seviye ve postsCount güncellenecekse
            }
        } catch (error) {
            console.error("Post save sonrası yazar güncelleme hatası:", error);
        }
    }
    next();
});



module.exports = mongoose.model('Post', PostSchema);