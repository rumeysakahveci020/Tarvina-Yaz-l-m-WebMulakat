const express = require('express');
const router = express.Router();
const { getUserProfile, updateUserProfile } = require('../controllers/userController'); // userController.js'in var olduğundan emin ol
const { protect } = require('../middleware/authMiddleware');

router.route('/profile').put(protect, updateUserProfile); // Kendi profilini güncelle
router.route('/:id').get(getUserProfile); // Herkese açık profil görüntüleme

module.exports = router;