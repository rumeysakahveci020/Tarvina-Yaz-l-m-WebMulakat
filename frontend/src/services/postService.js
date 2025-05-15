// frontend/src/services/postService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const POST_API_URL = `${API_BASE_URL}/posts/`;

// Yeni bir blog yazısı oluştur (token gerektirir)
const createPost = async (postData, token) => {
    // postData = { title, content, excerpt, category, imageUrl (opsiyonel) }
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
            // Eğer dosya yükleme olsaydı: 'Content-Type': 'multipart/form-data'
        },
    };
    const response = await axios.post(POST_API_URL, postData, config);
    return response.data; // Oluşturulan post objesi
};

// Tüm yayınlanmış yazıları getir (sayfalama ve filtreleme ile)
const getPosts = async (pageNumber = 1, keyword = '', category = '') => {
    let url = `${POST_API_URL}?pageNumber=${pageNumber}`;
    if (keyword) {
        url += `&keyword=${encodeURIComponent(keyword)}`;
    }
    if (category) {
        url += `&category=${encodeURIComponent(category)}`;
    }
    const response = await axios.get(url);
    return response.data; // { posts, page, pages }
};

// ID ile tek bir yazıyı getir
const getPost = async (postId) => {
    const response = await axios.get(POST_API_URL + postId);
    return response.data; // Post objesi
};

// Bir yazıyı güncelle (token gerektirir)
const updatePost = async (postId, postData, token) => {
    // postData = { title, content, excerpt, category, imageUrl, status (opsiyonel) }
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(POST_API_URL + postId, postData, config);
    return response.data; // Güncellenmiş post objesi
};

// Bir yazıyı sil (token gerektirir)
const deletePost = async (postId, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.delete(POST_API_URL + postId, config);
    return response.data; // Genellikle { message: 'Yazı başarıyla silindi' } döner
};

// Bir yazı için benzer içerikleri getir
const getSimilarPosts = async (postId) => {
    const response = await axios.get(`${POST_API_URL}${postId}/similar`);
    return response.data; // Benzer postların listesi
};


const postService = {
    createPost,
    getPosts,
    getPost,
    updatePost,
    deletePost,
    getSimilarPosts,
};

export default postService;