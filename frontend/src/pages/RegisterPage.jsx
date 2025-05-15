// frontend/src/pages/RegisterPage.jsx

// import React from 'react'; // Genellikle fonksiyonel bileşenler ve JSX için artık gerekli değil
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, reset as resetAuth } from '../features/auth/authSlice.js';
// import Spinner from '../components/UI/Spinner'; // Opsiyonel

function RegisterPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        password2: '', // Şifre tekrarı için
    });
    const { username, email, password, password2 } = formData;

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { user, token, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.auth
    );

    useEffect(() => {
        // Eğer zaten giriş yapmışsa (token varsa), ana sayfaya yönlendir
        if (token && user) {
            navigate('/');
        }
    }, [token, user, navigate]);

    useEffect(() => {
        if (isError && message) {
            alert(`Kayıt Hatası: ${message}`); // Daha iyi bir bildirim (toast) kullanılabilir
            dispatch(resetAuth()); // Hata sonrası auth state'ini resetle
        }

        if (isSuccess || (token && user)) { // Başarılı kayıt veya zaten girişli olma durumu
            // alert(message || "Kayıt başarılı!"); // Opsiyonel başarı mesajı
            navigate('/'); // Başarılı kayıt sonrası ana sayfaya yönlendir
            // dispatch(resetAuth()); // Yönlendirme sonrası cleanup'ta resetlenebilir
        }
        
        // Bu useEffect'in her render'da auth state'ini sıfırlamamasına dikkat et.
        // Sadece işlem bittikten sonra (isSuccess veya isError true ise) sıfırlanmalı.
        // Eğer isSuccess veya isError true ise ve mesaj varsa, cleanup'ta resetleyelim.
        return () => {
            if ((isSuccess || isError) && message) {
                // dispatch(resetAuth()); // Bu, yönlendirme sonrası hemen çalışacağı için sorun olabilir.
                                     // Resetleme işlemi navigate öncesi veya slice içinde yapılabilir.
            }
        };

    }, [user, token, isError, isSuccess, message, navigate, dispatch]);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const onSubmit = (e) => {
        e.preventDefault();
        dispatch(resetAuth()); // Önceki hataları temizle
        if (!username || !email || !password || !password2) {
            alert('Lütfen tüm alanları doldurun.');
            return;
        }
        if (password !== password2) {
            alert('Şifreler birbiriyle eşleşmiyor!');
            return;
        }
        if (password.length < 6) {
            alert('Şifre en az 6 karakter olmalıdır.');
            return;
        }
        const userData = { username, email, password };
        dispatch(register(userData));
    };

    // if (isLoading) {
    //     return <Spinner />;
    // }

    // Eğer kullanıcı zaten giriş yapmışsa, bu sayfayı gösterme (useEffect'te halledildi)
    // if (token && user) return null;

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 px-4 py-12 sm:px-6 lg:px-8"> {/* Arkaplan ve padding güncellendi */}
            <div className="w-full max-w-md bg-white shadow-2xl rounded-xl p-8 sm:p-10 space-y-8"> {/* Stil güncellendi */}
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">
                        Kalem Meydanı'na Katıl!
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Hemen bir hesap oluştur ve yazarlar arasındaki yerini al.
                    </p>
                </div>
                {/* isLoading && <div className="text-center text-sm text-indigo-600 mb-4">Hesap oluşturuluyor...</div> */}
                <form onSubmit={onSubmit} className="mt-8 space-y-6">
                    <div>
                        <label
                            htmlFor="username"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Kullanıcı Adı
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={username}
                            placeholder="benzersizkullaniciadi"
                            onChange={onChange}
                            required
                            minLength="3"
                            className="input-style mt-1"
                            disabled={isLoading}
                        />
                    </div>
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
                            Şifre (En az 6 karakter)
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={password}
                            placeholder="••••••••"
                            onChange={onChange}
                            required
                            minLength="6"
                            className="input-style mt-1"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <label
                            htmlFor="password2"
                            className="block text-sm font-medium text-gray-700"
                        >
                            Şifre Tekrar
                        </label>
                        <input
                            type="password"
                            name="password2"
                            id="password2"
                            value={password2}
                            placeholder="••••••••"
                            onChange={onChange}
                            required
                            minLength="6"
                            className="input-style mt-1"
                            disabled={isLoading}
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 text-base" // Stil güncellendi
                        >
                             {isLoading ? (
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            ) : 'Kayıt Ol'}
                        </button>
                    </div>
                </form>
                <p className="mt-6 text-center text-sm text-gray-600">
                    Zaten bir hesabın var mı?{' '}
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500 hover:underline">
                        Giriş Yap
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default RegisterPage;