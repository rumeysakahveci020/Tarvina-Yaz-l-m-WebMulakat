const express = require('express');
const router = express.Router();
const {
    createPost,
    getAllPosts,
    getPostById,
    updatePost,
    deletePost,
    getSimilarPosts
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createPost)
    .get(getAllPosts);

router.route('/:id')
    .get(getPostById)
    .put(protect, updatePost)
    .delete(protect, deletePost);

// Eğer getSimilarPosts controller'da tanımlıysa rotayı ekle
if (typeof getSimilarPosts === 'function') {
    router.get('/:id/similar', getSimilarPosts);
}


module.exports = router;