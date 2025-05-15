// frontend/src/pages/HomePage.jsx

// import React from 'react'; // Genellikle fonksiyonel bileşenler ve JSX için artık gerekli değil
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { getPosts, resetPostState } from '../features/posts/postsSlice.js'; // resetPostState eklendi
// import Spinner from '../components/UI/Spinner'; // Opsiyonel yükleniyor göstergesi

function HomePage() {
    const dispatch = useDispatch();
    const { posts, isLoading, isError, message } = useSelector((state) => state.posts);
    const { user } = useSelector((state) => state.auth); // Giriş yapmış kullanıcıyı kontrol etmek için

    useEffect(() => {
        // Sayfa yüklendiğinde yazıları getir
        dispatch(getPosts());

        // Sayfadan ayrılırken post state'ini temizle (opsiyonel, duruma göre karar verilir)
        // Bu, başka sayfalarda eski post listesinin görünmesini engeller veya
        // bir sonraki girişte taze veri yüklenmesini sağlar.
        return () => {
            // dispatch(resetPostState()); // Eğer her seferinde temizlenmesi isteniyorsa
        };
    }, [dispatch]);

    useEffect(() => {
        if (isError && message) {
            console.error("Ana sayfa yazıları yüklenirken hata:", message);
            // Burada kullanıcıya bir bildirim (toast) gösterilebilir.
            // alert(`Hata: ${message}`);
        }
    }, [isError, message]);

    if (isLoading && posts.length === 0) { // Sadece ilk yüklemede ve hiç post yokken göster
        // return <Spinner />;
        return <div className="text-center mt-12 text-xl text-gray-600">Yazılar yükleniyor, lütfen bekleyin...</div>;
    }

    if (isError && posts.length === 0) { // Hata varsa ve hiç post yüklenememişse
         return (
            <div className="text-center mt-12">
                <p className="text-xl text-red-600">Yazılar yüklenirken bir sorun oluştu.</p>
                <p className="text-gray-500 mt-2">{message}</p>
                <button
                    onClick={() => dispatch(getPosts())}
                    className="mt-4 btn-secondary px-6 py-2"
                >
                    Tekrar Dene
                </button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-10">
                <h1 className="text-4xl font-extrabold text-gray-800 mb-4 sm:mb-0">
                    En Son Yazılar
                </h1>
                {user && (
                    <Link
                        to="/create-post"
                        className="btn-primary px-5 py-2.5 text-sm font-medium" // Stil güncellendi
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H5a1 1 0 110-2h4V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Yeni Yazı Ekle
                    </Link>
                )}
            </div>

            {posts && posts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {posts.map((post) => (
                        <div
                            key={post._id}
                            className="card transform hover:scale-105 transition-transform duration-300 ease-out flex flex-col" // flex flex-col eklendi
                        >
                            {/* Kazanan Rozeti */}
                            {post.battleWins > 0 && (
                                <div className="absolute top-3 right-3 bg-gradient-to-r from-yellow-400 to-amber-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg z-10 transform rotate-3">
                                    🏆 {post.battleWins} Kez Kazandı!
                                </div>
                            )}
                            {post.imageUrl && (
                                <Link to={`/posts/${post._id}`} className="block h-48 overflow-hidden rounded-t-lg">
                                    <img
                                        src={post.imageUrl}
                                        alt={post.title}
                                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                    />
                                </Link>
                            )}
                            <div className="p-6 flex flex-col flex-grow"> {/* flex-grow eklendi */}
                                <div className="mb-2">
                                    <span className="inline-block bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                                        {post.category}
                                    </span>
                                </div>
                                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2 min-h-[3.5rem] line-clamp-2"> {/* min-h ve line-clamp eklendi */}
                                    <Link to={`/posts/${post._id}`} className="hover:text-indigo-600 transition-colors">
                                        {post.title}
                                    </Link>
                                </h2>
                                <p className="text-gray-500 text-xs mb-3">
                                    <Link to={`/profile/${post.author?._id}`} className="hover:underline">
                                      Yazar: <span className="font-medium text-gray-700">{post.author?.username || 'Bilinmeyen Yazar'}</span>
                                    </Link>
                                    {' · '}
                                    {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </p>
                                <p className="text-gray-700 text-sm mb-4 leading-relaxed flex-grow min-h-[4.5rem] line-clamp-3"> {/* flex-grow, min-h ve line-clamp */}
                                    {post.excerpt}
                                </p>
                                <div className="mt-auto"> {/* Butonu en alta iter */}
                                    <Link
                                        to={`/posts/${post._id}`}
                                        className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-semibold transition-colors group"
                                    >
                                        Devamını Oku
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                        </svg>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !isLoading && (
                    <div className="text-center py-12">
                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-center text-gray-500 mt-4 text-xl">Görünüşe göre buralar biraz sessiz...</p>
                        <p className="text-gray-400 mt-1">Henüz hiç yazı yayınlanmamış. İlk kalemi sen salla!</p>
                        {user && (
                             <Link
                                to="/create-post"
                                className="mt-6 btn-primary px-6 py-2.5 inline-block"
                            >
                                İlk Yazıyı Sen Ekle
                            </Link>
                        )}
                    </div>
                )
            )}
            {/* Sayfalama Eklenebilir */}
        </div>
    );
}

export default HomePage;