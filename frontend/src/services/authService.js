// frontend/src/services/authService.js
import axios from 'axios';

// Backend API URL'niz (genellikle .env dosyasından gelir)
const API_BASE_URL = import.meta.env.VITE_API_URL; // VITE_API_URL=http://localhost:5001/api
const AUTH_API_URL = `${API_BASE_URL}/auth/`;

// Yeni kullanıcı kaydı
const register = async (userData) => {
    // userData = { username, email, password }
    const response = await axios.post(AUTH_API_URL + 'register', userData);
    // Başarılı kayıt sonrası backend'den dönen kullanıcı bilgisi ve token'ı ele al
    if (response.data && response.data.token) {
        // Token'ı ve kullanıcı bilgilerini localStorage'a kaydet (isteğe bağlı)
        localStorage.setItem('userToken', JSON.stringify(response.data.token));
        localStorage.setItem('userInfo', JSON.stringify(response.data)); // _id, username, email, level içerir
    }
    return response.data; // { _id, username, email, level, token }
};

// Kullanıcı girişi
const login = async (userData) => {
    // userData = { email, password }
    const response = await axios.post(AUTH_API_URL + 'login', userData);
    // Başarılı giriş sonrası backend'den dönen kullanıcı bilgisi ve token'ı ele al
    if (response.data && response.data.token) {
        localStorage.setItem('userToken', JSON.stringify(response.data.token));
        localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    return response.data; // { _id, username, email, level, token }
};

// Kullanıcı çıkışı
const logout = () => {
    // localStorage'dan token ve kullanıcı bilgilerini kaldır
    localStorage.removeItem('userToken');
    localStorage.removeItem('userInfo');
    // Backend tarafında token'ı geçersiz kılma gibi bir işlem varsa, o API'ye istek atılabilir (opsiyonel).
};

// Giriş yapmış kullanıcının bilgilerini getir (token ile)
const getMe = async (token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`, // Token'ı Authorization header'ında gönder
        },
    };
    const response = await axios.get(AUTH_API_URL + 'me', config);
    // Backend'den dönen güncel kullanıcı bilgilerini döndür
    // Bu, localStorage'daki userInfo'yu tazelemek için kullanılabilir.
    if (response.data) {
        // İsteğe bağlı olarak localStorage'daki userInfo'yu burada da güncelleyebilirsiniz.
        // localStorage.setItem('userInfo', JSON.stringify(response.data));
    }
    return response.data; // { _id, username, email, profile, level, postsCount, battleWinsCount }
};

// Servis fonksiyonlarını bir obje içinde export et
const authService = {
    register,
    login,
    logout,
    getMe,
};

export default authService;