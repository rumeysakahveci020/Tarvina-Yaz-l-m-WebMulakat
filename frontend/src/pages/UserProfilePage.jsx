// frontend/src/pages/UserProfilePage.jsx

// import React from 'react'; // Gereksizse kaldırıldı
import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getMe } from '../features/auth/authSlice.js'; // Kendi profilini güncellemek için
import userService from '../services/userService.js'; // Başkasının profilini çekmek için
// import { getPostsByAuthor, resetPosts } from '../features/posts/postSlice'; // Kullanıcının yazılarını çekmek için

function UserProfilePage({ selfProfile = false }) {
    const { userId: paramsUserId } = useParams(); // URL'den gelen :userId parametresi
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Giriş yapmış kullanıcı bilgileri (kendi profilini görüntülüyorsa veya düzenleyecekse)
    const { user: loggedInUser, token } = useSelector((state) => state.auth);
    // Kullanıcının yazılarını listelemek için post state'i (opsiyonel)
    // const { posts: userPosts, isLoading: postsLoading, isError: postsError } = useSelector(state => state.posts);

    const [profileData, setProfileData] = useState(null); // Görüntülenen kullanıcının profil verileri
    const [userWrittenPosts, setUserWrittenPosts] = useState([]); // Görüntülenen kullanıcının yazıları
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // Görüntülenecek kullanıcının ID'sini belirle
    const targetUserId = selfProfile ? loggedInUser?._id : paramsUserId;

    useEffect(() => {
        // Eğer kendi profilini görüntülüyorsa ve giriş yapmamışsa login'e yönlendir
        if (selfProfile && !loggedInUser) {
            navigate('/login', { state: { from: { pathname: '/my-profile' } } });
            return;
        }

        // Eğer görüntülenecek kullanıcı ID'si yoksa hata ver
        if (!targetUserId) {
            setError('Kullanıcı bilgisi bulunamadı.');
            setIsLoading(false);
            setProfileData(null);
            setUserWrittenPosts([]);
            return;
        }

        const fetchUserProfileAndPosts = async () => {
            setIsLoading(true);
            setError('');
            setProfileData(null);
            setUserWrittenPosts([]);

            try {
                let userResponse;
                // Kendi profili ise /auth/me, başkasının profili ise /users/:id endpoint'ini kullan
                if (selfProfile && token) { // Kendi profilini getMe ile tazeleyebiliriz
                    // Eğer loggedInUser zaten güncelse direkt onu kullanabiliriz veya getMe ile tazeleyebiliriz.
                    // Şimdilik, eğer Redux'taki loggedInUser verisi selfProfile için yeterliyse onu kullanalım.
                    // Eğer getMe'den daha detaylı veri geliyorsa o tercih edilebilir.
                    if (loggedInUser?._id === targetUserId) {
                        setProfileData(loggedInUser);
                         // Kendi yazılarımızı çekmek için backend'e bir istek daha atalım
                        const postsResponse = await userService.getUserProfile(targetUserId); // userService'de böyle bir fonksiyon olmalı veya postsService'de
                        setUserWrittenPosts(postsResponse.posts || []); // Varsayım: getUserProfile hem user hem posts döner
                    } else {
                        // Bu durum olmamalı, selfProfile true iken targetUserId loggedInUser._id olmalı
                        const meResponse = await dispatch(getMe()).unwrap(); // getMe thunk'ını çalıştır
                        setProfileData(meResponse);
                        const postsResponse = await userService.getUserProfile(targetUserId);
                        setUserWrittenPosts(postsResponse.posts || []);
                    }
                } else {
                    // Başkasının profilini ve yazılarını çek
                    userResponse = await userService.getUserProfile(targetUserId);
                    setProfileData(userResponse.user);
                    setUserWrittenPosts(userResponse.posts || []);
                }
            } catch (err) {
                const errMsg = err.response?.data?.message || err.message || 'Profil bilgileri yüklenirken bir hata oluştu.';
                setError(errMsg);
                console.error("Profil yükleme hatası:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfileAndPosts();

        // Eğer post slice'ında kullanıcının yazılarını ayrıca yönetiyorsanız:
        // dispatch(getPostsByAuthor(targetUserId));
        // return () => {
        //     dispatch(resetPosts()); // Sayfadan ayrılırken postları temizle
        // };

    }, [targetUserId, selfProfile, loggedInUser, token, navigate, dispatch]);


    if (isLoading) {
        return <div className="text-center py-12 text-xl text-gray-600">Profil yükleniyor, lütfen bekleyin...</div>;
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-xl text-red-500">Bir Hata Oluştu!</p>
                <p className="text-gray-500 mt-2">{error}</p>
                <Link to="/" className="mt-6 btn-secondary px-6 py-2 inline-block">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    if (!profileData) {
        return (
             <div className="text-center py-12">
                <p className="text-xl text-gray-700">Kullanıcı profili bulunamadı.</p>
                <Link to="/" className="mt-6 btn-secondary px-6 py-2 inline-block">Ana Sayfaya Dön</Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Profil Bilgileri Kartı */}
            <div className="bg-white shadow-2xl rounded-xl overflow-hidden mb-10">
                <div className="md:flex">
                    <div className="md:flex-shrink-0 p-6 md:p-8 flex justify-center md:justify-start">
                        <img
                            src={profileData.profile?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData.username)}&background=random&size=160&color=fff&font-size=0.5`}
                            alt={`${profileData.username} profil fotoğrafı`}
                            className="h-32 w-32 md:h-40 md:w-40 rounded-full object-cover border-4 border-indigo-500 shadow-lg"
                        />
                    </div>
                    <div className="p-6 md:p-8 flex-grow">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                                {profileData.username}
                            </h1>
                            <span className="mt-2 sm:mt-0 inline-block bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs sm:text-sm font-semibold px-3 py-1.5 rounded-full shadow">
                                {profileData.level || 'Seviye Yok'}
                            </span>
                        </div>
                        {profileData.profile?.bio && (
                            <p className="mt-3 text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {profileData.profile.bio}
                            </p>
                        )}
                        <div className="mt-6 grid grid-cols-2 gap-4 text-center">
                            <div className="bg-indigo-50 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-indigo-700">{profileData.postsCount || 0}</p>
                                <p className="text-xs text-indigo-500 uppercase tracking-wider">Yazı Sayısı</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg">
                                <p className="text-2xl font-bold text-purple-700">{profileData.battleWinsCount || 0}</p>
                                <p className="text-xs text-purple-500 uppercase tracking-wider">Kazanılan Düello</p>
                            </div>
                        </div>
                        {selfProfile && (
                            <div className="mt-6">
                                <button 
                                    onClick={() => alert("Profil düzenleme özelliği yakında eklenecektir.")} 
                                    className="btn-secondary w-full sm:w-auto px-5 py-2.5 text-sm font-medium inline-flex items-center justify-center"
                                >
                                     <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                    </svg>
                                    Profilini Düzenle
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Yazarın Yazıları Bölümü */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b-2 border-indigo-500">
                    {selfProfile ? "Yazdıklarım" : `${profileData.username}'in Yazıları`}
                </h2>
                {/* {postsLoading && <div className="text-center text-gray-500">Yazılar yükleniyor...</div>} */}
                {/* {postsError && !postsLoading && <div className="text-center text-red-500">Yazılar yüklenirken bir hata oluştu.</div>} */}
                
                {userWrittenPosts && userWrittenPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {userWrittenPosts.map(post => (
                            <div key={post._id} className="card p-5 hover:shadow-xl transition-shadow duration-300">
                                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                                    <Link to={`/posts/${post._id}`} className="hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </Link>
                                </h3>
                                <p className="text-gray-500 text-xs mb-3">
                                    Yayınlanma Tarihi: {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-gray-700 text-sm leading-relaxed line-clamp-3 mb-4">
                                    {post.excerpt}
                                </p>
                                <Link
                                    to={`/posts/${post._id}`}
                                    className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-800 font-medium group"
                                >
                                    Yazıya Git
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    !isLoading && <p className="text-center text-gray-500 py-8">Bu yazarın henüz yayınlanmış bir yazısı bulunmuyor.</p>
                )}
            </div>
        </div>
    );
}

export default UserProfilePage;