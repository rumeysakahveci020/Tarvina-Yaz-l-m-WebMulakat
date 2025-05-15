const Post = require('../models/Post');
const User = require('../models/User'); // Gerekirse yazar bilgilerini almak için
const mongoose = require('mongoose');

// @desc    Yeni bir yazı oluştur
// @route   POST /api/posts
// @access  Private (Giriş yapmış kullanıcılar)
exports.createPost = async (req, res, next) => {
    const { title, content, excerpt, category, imageUrl } = req.body;
    try {
        if (!title || !content || !excerpt || !category) {
            res.status(400);
            throw new Error('Lütfen tüm zorunlu alanları doldurun: başlık, içerik, özet, kategori.');
        }

        const post = new Post({
            title,
            content,
            excerpt,
            category,
            imageUrl: imageUrl || '',
            author: req.user.id, // protect middleware'inden gelen kullanıcı ID'si
            status: 'yayinda' // Modelde varsayılan olarak ayarlandı ama burada da belirtilebilir
        });

        const createdPost = await post.save(); // Bu, Post modelindeki post-save hook'unu tetikler
        res.status(201).json(createdPost);
    } catch (error) {
        if (error.name === 'ValidationError') { // Mongoose doğrulama hatası
            res.status(400);
        }
        next(error);
    }
};

// @desc    Tüm yayınlanmış yazıları getir
// @route   GET /api/posts
// @access  Public
exports.getAllPosts = async (req, res, next) => {
    try {
        const pageSize = 10; // Sayfa başına yazı sayısı
        const page = Number(req.query.pageNumber) || 1; // Sayfa numarası

        const keyword = req.query.keyword 
            ? { title: { $regex: req.query.keyword, $options: 'i' } } // Başlıkta arama (büyük/küçük harf duyarsız)
            : {};
        
        const categoryFilter = req.query.category
            ? { category: req.query.category }
            : {};

        const count = await Post.countDocuments({ ...keyword, ...categoryFilter, status: 'yayinda' });
        const posts = await Post.find({ ...keyword, ...categoryFilter, status: 'yayinda' })
            .populate('author', 'username avatarUrl') // Yazarın sadece kullanıcı adını ve avatarını al
            .sort({ createdAt: -1 }) // En yeniler üstte
            .limit(pageSize)
            .skip(pageSize * (page - 1));
            
        res.json({ posts, page, pages: Math.ceil(count / pageSize) });
    } catch (error) {
        next(error);
    }
};

// @desc    ID ile tek bir yazıyı getir
// @route   GET /api/posts/:id
// @access  Public
exports.getPostById = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error('Geçersiz yazı ID formatı.');
        }
        const post = await Post.findById(req.params.id)
                             .populate('author', 'username avatarUrl level'); // Yazarın seviyesini de alalım

        if (!post) {
            res.status(404);
            throw new Error('Yazı bulunamadı.');
        }
        // Taslak veya arşivlenmişse sadece yazar görebilir (opsiyonel)
        if (post.status !== 'yayinda' && post.status !== 'karsilasmada') {
             if (!req.user || req.user.id.toString() !== post.author._id.toString()) {
                 res.status(403); // Forbidden
                 throw new Error('Bu yazıya erişim yetkiniz yok.');
             }
        }
        res.json(post);
    } catch (error) {
        next(error);
    }
};

// @desc    Bir yazıyı güncelle
// @route   PUT /api/posts/:id
// @access  Private (Sadece yazının sahibi)
exports.updatePost = async (req, res, next) => {
    const { title, content, excerpt, category, imageUrl, status } = req.body;
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error('Geçersiz yazı ID formatı.');
        }
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404);
            throw new Error('Güncellenecek yazı bulunamadı.');
        }

        // Yazının sahibi mi kontrol et
        if (post.author.toString() !== req.user.id) {
            // Belki admin de düzenleyebilir, o zaman authorize('admin') veya ek kontrol
            res.status(403); // Forbidden
            throw new Error('Bu yazıyı güncelleme yetkiniz yok.');
        }

        post.title = title || post.title;
        post.content = content || post.content;
        post.excerpt = excerpt || post.excerpt;
        post.category = category || post.category;
        post.imageUrl = imageUrl !== undefined ? imageUrl : post.imageUrl; // imageUrl boş string olarak gelebilir
        
        // Sadece belirli statü değişikliklerine izin verilebilir
        const allowedStatusUpdates = ['yayinda', 'taslak', 'arsivlendi'];
        if (status && allowedStatusUpdates.includes(status)) {
            post.status = status;
        }

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400);
        }
        next(error);
    }
};

// @desc    Bir yazıyı sil
// @route   DELETE /api/posts/:id
// @access  Private (Sadece yazının sahibi veya admin)
exports.deletePost = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error('Geçersiz yazı ID formatı.');
        }
        const post = await Post.findById(req.params.id);

        if (!post) {
            res.status(404);
            throw new Error('Silinecek yazı bulunamadı.');
        }

        // Yazının sahibi mi veya admin mi kontrol et
        // if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
        if (post.author.toString() !== req.user.id) {
            res.status(403);
            throw new Error('Bu yazıyı silme yetkiniz yok.');
        }

        // Eğer yazı bir karşılaşmadaysa silinmesine izin verme veya karşılaşmayı iptal et
        if (post.status === 'karsilasmada') {
            res.status(400);
            throw new Error('Bu yazı şu anda bir karşılaşmada olduğu için silinemez. Önce karşılaşmayı sonlandırın.');
        }
        
        await post.deleteOne(); // Mongoose v6+

        // Yazarın yazı sayısını azalt
        const author = await User.findById(post.author);
        if (author) {
            author.postsCount = Math.max(0, (author.postsCount || 0) - 1);
            await author.updateLevel();
            await author.save({ validateBeforeSave: false });
        }

        res.json({ message: 'Yazı başarıyla silindi.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Benzer yazıları getir
// @route   GET /api/posts/:id/similar
// @access  Public
exports.getSimilarPosts = async (req, res, next) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            res.status(400);
            throw new Error('Geçersiz yazı ID formatı.');
        }
        const currentPost = await Post.findById(req.params.id).select('category _id');
        if (!currentPost) {
            res.status(404);
            throw new Error('Ana yazı bulunamadı.');
        }

        const similarPosts = await Post.find({
            category: currentPost.category,
            _id: { $ne: currentPost._id }, // Mevcut yazıyı hariç tut
            status: 'yayinda'
        })
        .sort({ battleWins: -1, createdAt: -1 }) // Önce kazanma sayısına, sonra tarihe göre
        .limit(3) // En fazla 3 benzer yazı
        .select('title excerpt imageUrl author category battleWins')
        .populate('author', 'username');

        res.json(similarPosts);
    } catch (error) {
        next(error);
    }
};