const Battle = require('../models/Battle');
const Post = require('../models/Post');
const Vote = require('../models/Vote');
const mongoose = require('mongoose');

// @desc    Yeni bir karşılaşma oluştur (manuel veya sistem tarafından)
// @route   POST /api/battles/create
// @access  Private (Admin veya belirli yetkili kullanıcılar)
exports.createBattle = async (req, res, next) => {
    const { post1Id, post2Id, category, round } = req.body;
    try {
        if (!post1Id || !post2Id) {
            res.status(400);
            throw new Error("Karşılaşma için iki yazı ID'si gereklidir.");
        }
        if (post1Id === post2Id) {
            res.status(400);
            throw new Error("Aynı yazılar birbiriyle karşılaşamaz.");
        }
        if (!mongoose.Types.ObjectId.isValid(post1Id) || !mongoose.Types.ObjectId.isValid(post2Id)) {
            res.status(400);
            throw new Error("Geçersiz yazı ID formatı.");
        }

        const [post1, post2] = await Promise.all([
            Post.findById(post1Id),
            Post.findById(post2Id)
        ]);

        if (!post1 || !post2) {
            res.status(404);
            throw new Error("Karşılaşacak yazılardan biri veya ikisi bulunamadı.");
        }
        if (post1.status !== 'yayinda' || post2.status !== 'yayinda') {
            res.status(400);
            throw new Error("Sadece 'yayinda' durumundaki yazılar karşılaşabilir.");
        }

        const battle = new Battle({
            post1: post1Id,
            post2: post2Id,
            category: category || post1.category,
            round: round || 1,
            status: 'aktif' // Yeni karşılaşma direkt aktif başlasın
        });

        const createdBattle = await battle.save(); // Bu, Battle modelindeki post-save hook'unu tetikler
        res.status(201).json(createdBattle);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400);
        }
        next(error);
    }
};

// @desc    Oylama için aktif bir karşılaşma getir
// @route   GET /api/battles/active
// @access  Public (veya Private, protect middleware'i opsiyonel)
exports.getActiveBattle = async (req, res, next) => {
    try {
        // Kullanıcının daha önce oy vermediği, rastgele bir aktif karşılaşma bul
        // Bu kısım daha da geliştirilebilir (örn: en az oy alan, en yeni vs.)
        // Şimdilik: En son oluşturulmuş aktif karşılaşma
        const activeBattle = await Battle.findOne({ status: 'aktif' })
            .sort({ createdAt: -1 })
            .populate({ path: 'post1', select: 'title imageUrl excerpt author category', populate: { path: 'author', select: 'username' }})
            .populate({ path: 'post2', select: 'title imageUrl excerpt author category', populate: { path: 'author', select: 'username' }});

        if (!activeBattle) {
            // 404 yerine, mesajla birlikte 200 dönebiliriz, frontend bunu uygun şekilde işler.
            return res.status(200).json({ message: 'Şu an aktif bir karşılaşma bulunmuyor.', battle: null });
        }

        let userVote = null;
        if (req.user) { // Eğer kullanıcı giriş yapmışsa (optionalProtect middleware'i sayesinde)
            const vote = await Vote.findOne({ battle: activeBattle._id, user: req.user.id });
            if (vote) {
                userVote = vote.votedForPost; // Kullanıcının hangi posta oy verdiğini gönder
            }
        }
        res.json({ battle: activeBattle, userVote });
    } catch (error) {
        next(error);
    }
};

// @desc    Bir karşılaşmada oy kullan
// @route   POST /api/battles/:battleId/vote
// @access  Private (Sadece giriş yapmış kullanıcılar)
exports.voteInBattle = async (req, res, next) => {
    const { battleId } = req.params;
    const { postIdVotedFor } = req.body;
    const userId = req.user.id;

    try {
        if (!mongoose.Types.ObjectId.isValid(battleId) || !mongoose.Types.ObjectId.isValid(postIdVotedFor)) {
            res.status(400);
            throw new Error("Geçersiz ID formatı.");
        }

        const battle = await Battle.findById(battleId);
        if (!battle) {
            res.status(404);
            throw new Error('Karşılaşma bulunamadı.');
        }
        if (battle.status !== 'aktif') {
            res.status(400);
            throw new Error('Bu karşılaşma için oylama aktif değil.');
        }
        if (battle.post1.toString() !== postIdVotedFor && battle.post2.toString() !== postIdVotedFor) {
            res.status(400);
            throw new Error('Geçersiz oy. Lütfen karşılaşmadaki yazılardan birini seçin.');
        }
        
        // Vote.create() zaten unique index ihlalinde hata fırlatacaktır.
        // const existingVote = await Vote.findOne({ battle: battleId, user: userId });
        // if (existingVote) {
        //     res.status(400);
        //     throw new Error('Bu karşılaşma için zaten oy kullandınız.');
        // }

        await Vote.create({ // Bu, Vote modelindeki post-save hook'unu tetikler
            battle: battleId,
            user: userId,
            votedForPost: postIdVotedFor
        });
        
        // Oy sayıları Vote modelindeki hook ile güncellendiğinden,
        // güncel battle'ı tekrar çekip döndürelim.
        const updatedBattle = await Battle.findById(battleId)
            .populate('post1', 'title') // Sadece başlık yeterli olabilir
            .populate('post2', 'title');

        res.status(200).json({ message: 'Oyunuz başarıyla kaydedildi.', battle: updatedBattle });
    } catch (error) {
        if (error.code === 11000) { // MongoDB duplicate key error
            res.status(400);
            // Hata mesajını daha kullanıcı dostu hale getir
            next(new Error('Bu karşılaşma için zaten oy kullandınız.'));
        } else {
            next(error);
        }
    }
};

// @desc    Bir karşılaşmanın sonuçlarını getir
// @route   GET /api/battles/:battleId/results
// @access  Public
exports.getBattleResults = async (req, res, next) => {
    const { battleId } = req.params;
    try {
        if (!mongoose.Types.ObjectId.isValid(battleId)) {
            res.status(400);
            throw new Error('Geçersiz karşılaşma ID formatı.');
        }
        const battle = await Battle.findById(battleId)
            .populate('post1', 'title imageUrl')
            .populate('post2', 'title imageUrl')
            .populate('winner', 'title'); // Kazanan yazının sadece başlığını al

        if (!battle) {
            res.status(404);
            throw new Error('Karşılaşma bulunamadı.');
        }
        res.json(battle);
    } catch (error) {
        next(error);
    }
};

// TODO: Otomatik Eşleştirme Servisi (Admin panelinden tetiklenebilir veya cron job)
// exports.triggerAutoMatchmaking = async (req, res, next) => { ... }