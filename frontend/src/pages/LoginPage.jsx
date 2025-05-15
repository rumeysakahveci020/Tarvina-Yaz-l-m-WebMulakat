// frontend/src/pages/LoginPage.jsx

// import React from 'react';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, reset as resetAuth } from "../features/auth/authSlice.js";
import './LoginPage.css'; // Animasyonlu arkaplan için özel CSS

function LoginPage() {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const { email, password } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();

    const { user, token, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    // Kullanıcının login olmadan önce gitmek istediği yolu al
    const from = location.state?.from?.pathname || "/";

    useEffect(() => {
        // Eğer zaten giriş yapmışsa, ana sayfaya veya 'from'a yönlendir
        if (token && user) {
            navigate(from, { replace: true });
        }
    }, [token, user, navigate, from]);


    useEffect(() => {
        if (isError && message) {
            alert(`Giriş Hatası: ${message}`); // Daha iyi bir bildirim sistemi (toast) kullanılabilir
            // Hata mesajı gösterildikten sonra temizlenebilir
            // dispatch(clearMessage()); // authSlice'a eklenecek bir action
            dispatch(resetAuth()); // Veya komple auth state'ini resetle (message hariç tutulabilir)
        }

        if (isSuccess && token && user) { // Başarılı giriş sonrası
            // alert(message || "Giriş başarılı!"); // Opsiyonel başarı mesajı
            navigate(from, { replace: true }); // Yönlendir
        }

        // Bu useEffect'in her render'da auth state'ini (isSuccess, isError) sıfırlamamasına dikkat et.
        // Sadece login/register işlemi bittikten sonra sıfırlanmalı.
        // 'resetAuth' dispatch'ini onSubmit sonrası veya belirli koşullarda yapmak daha iyi olabilir.
        // Şimdilik, eğer isSuccess veya isError true ise ve mesaj varsa sıfırlayalım.
        if ((isSuccess || isError) && message) {
            // return () => { dispatch(resetAuth()); } // Cleanup'ta resetle
        }

    }, [isError, isSuccess, message, navigate, dispatch, from, token, user]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(resetAuth()); // Önceki hataları temizle
        if (!email || !password) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
        const userData = { email, password };
        dispatch(login(userData));
    };

    // Giriş yapmışsa bu sayfayı gösterme (useEffect'te halledildi)
    // if (token && user) return null; 

    return (
        <div className="login-page-container">
            <div className="animated-bg">
                {[...Array(12)].map((_, i) => ( // Kitap sayısı artırıldı
                    <div 
                        key={i} 
                        className="book-falling" 
                        style={{
                            animationDuration: `${Math.random() * 5 + 8}s`, // 8-13s arası
                            animationDelay: `-${Math.random() * 10}s`,      // Rastgele başlangıç
                            left: `${Math.random() * 90 + 5}%`,            // %5 ile %95 arası
                            transform: `rotate(${Math.random() * 40 - 20}deg) scale(${Math.random() * 0.3 + 0.8})`, // Rastgele dönüş ve boyut
                            // backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)` // Rastgele renk (opsiyonel)
                        }}
                    ></div>
                ))}
            </div>

            <div className="login-form-wrapper p-8 sm:p-10 bg-white shadow-2xl rounded-xl w-full max-w-md z-10">
                <div className="text-center mb-8">
                    <Link to="/" className="inline-block">
                         {/* Logo Eklenebilir */}
                         <h1 className="text-3xl font-bold text-indigo-600">Kalem Meydanı'na Hoş Geldin!</h1>
                    </Link>
                    <p className="text-gray-500 mt-2">Hesabınıza giriş yaparak yazmaya ve oylamaya başlayın.</p>
                </div>

                {/* isLoading && <div className="text-center text-sm text-indigo-600 mb-4">Giriş yapılıyor...</div> */}
                
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700"
                        >
                            E-posta Adresi
                        </label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            value={email}
                            placeholder="ornek@eposta.com"
                            onChange={onChange}
                            required
                            className="input-style mt-1"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Şifre
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            placeholder="••••••••"
                            onChange={onChange}
                            required
                            className="input-style mt-1"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="text-sm">
                            {/* <a href="#" className="font-medium text-indigo-600 hover:text-indigo-500">
                                Şifremi Unuttum
                            </a> */}
                        </div>
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 text-base" // Boyut artırıldı
                        >
                            {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Giriş Yap'}
                        </button>
                    </div>
                </form>
                <p className="mt-8 text-center text-sm text-gray-600">
                    Hesabın yok mu?{' '}
                    <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                        Hemen Kayıt Ol
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default LoginPage;