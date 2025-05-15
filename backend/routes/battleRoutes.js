const express = require('express');
const router = express.Router();
const {
    createBattle,
    getActiveBattle,
    voteInBattle,
    getBattleResults
} = require('../controllers/battleController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Opsiyonel protect middleware'i
const optionalProtect = (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        return protect(req, res, next); // protect'i çağır
    }
    // Token yoksa req.user tanımsız olacak, controller bunu dikkate almalı
    next();
};

// Yeni karşılaşma oluşturma (Belki admin yetkisi gerekir)
// router.post('/create', protect, authorize('admin'), createBattle);
router.post('/create', protect, createBattle); // Şimdilik sadece giriş yapmış kullanıcılar

router.get('/active', optionalProtect, getActiveBattle);
router.post('/:battleId/vote', protect, voteInBattle);
router.get('/:battleId/results', getBattleResults);

module.exports = router;