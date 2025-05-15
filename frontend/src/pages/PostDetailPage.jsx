// frontend/src/pages/PostDetailPage.jsx

// import React from 'react';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPost, deletePost, resetPostState, getSimilarPosts } from '../features/posts/postsSlice.js'; // getSimilarPosts eklendi
// import DOMPurify from 'dompurify'; // Eğer HTML render ediyorsanız

function PostDetailPage() {
    const { postId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { post, isLoading, isError, message, isDeleted, similarPosts } = useSelector((state) => state.posts); // similarPosts eklendi
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const [isDeleting, setIsDeleting] = useState(false); // Silme işlemi için ayrı loading state

    useEffect(() => {
        if (postId) {
            dispatch(getPost(postId));
            dispatch(getSimilarPosts(postId)); // Benzer yazıları çek
        }
        // Sayfadan ayrılırken state'i temizle
        return () => {
            dispatch(resetPostState());
        };
    }, [dispatch, postId]);

    useEffect(() => {
        if (isError && message && !isLoading) { // Sadece ana veri yükleme hatası ise
            console.error("Yazı detayı yüklenirken hata:", message);
            // alert(`Hata: ${message}`); // Bildirim sistemi
        }
    }, [isError, message, isLoading]);

    useEffect(() => {
        if (isDeleted) {
            alert('Yazınız başarıyla silindi.');
            navigate('/'); // Ana sayfaya yönlendir
        }
    }, [isDeleted, navigate]);

    const handleDeletePost = async () => {
        if (window.confirm('Bu yazıyı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
            setIsDeleting(true);
            dispatch(deletePost(postId))
                .unwrap()
                .catch(err => {
                    alert(`Silme Hatası: ${err.message || 'Bir sorun oluştu.'}`);
                })
                .finally(() => setIsDeleting(false));
        }
    };

    if (isLoading && !post) { // Sadece ilk yüklemede ve post yoksa
        return <div className="text-center mt-12 text-xl text-gray-600">Yazı yükleniyor...</div>;
    }

    if ((isError && !post && !isLoading) || (!post && !isLoading && !isDeleted) ) {
        return (
            <div className="text-center mt-12">
                <h2 className="text-2xl text-red-600 mb-4">{message || 'Aradığınız yazı bulunamadı veya bir hata oluştu.'}</h2>
                <Link to="/" className="btn-secondary px-6 py-2 inline-block">Ana Sayfaya Dön</Link>
            </div>
        );
    }
    if (!post) return null; // Eğer post hala null ise (çok nadir bir durum)

    // İçeriği satır sonlarına göre paragraflara bölmek (basit çözüm)
    // Daha gelişmiş bir çözüm için Markdown parser (örn: react-markdown) kullanılabilir.
    const formattedContent = post.content.split('\n').map((paragraph, index) => (
        paragraph.trim() === '' ? <br key={`br-${index}`} /> : // Boş satırları <br> yap
        <p key={index} className="mb-4 leading-relaxed text-gray-700 text-lg">
            {paragraph}
        </p>
    ));

    const authorId = post.author?._id || post.author;
    const isAuthor = loggedInUser && authorId && loggedInUser._id === authorId;

    return (
        <div className="max-w-4xl mx-auto px-4 py-8"> {/* max-w artırıldı */}
            <article className="bg-white shadow-2xl rounded-xl overflow-hidden"> {/* Stil güncellendi */}
                {post.imageUrl && (
                    <div className="w-full h-64 sm:h-80 md:h-96 overflow-hidden">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
                <div className="p-6 sm:p-8 md:p-10">
                    <header className="mb-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm mb-4 inline-flex items-center group">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                    </svg>
                                    Tüm Yazılara Geri Dön
                                </Link>
                                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mt-2 mb-3">
                                    {post.title}
                                </h1>
                            </div>
                            {post.battleWins > 0 && (
                                <div className="flex-shrink-0 ml-4 mt-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-md">
                                    🏆 {post.battleWins} Kez Kazandı
                                </div>
                            )}
                        </div>
                        <div className="text-gray-500 text-sm mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h10a3 3 0 013 3v5a.997.997 0 01-.293-.707zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                </svg>
                                Kategori:
                                <span className="ml-1 px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                                    {post.category}
                                </span>
                            </span>
                            <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                                Yazar:
                                <Link to={`/profile/${authorId}`} className="font-medium text-gray-700 hover:text-indigo-600 ml-1">
                                    {post.author?.username || 'Bilinmiyor'} ({post.author?.level || 'Seviye Yok'})
                                </Link>
                            </span>
                            <span className="inline-flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                </svg>
                                Tarih: {new Date(post.createdAt).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                        </div>

                        {isAuthor && (
                            <div className="mt-6 flex space-x-3">
                                <Link
                                    to={`/posts/${post._id}/edit`}
                                    className="btn-secondary px-5 py-2 text-sm inline-flex items-center"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                                        <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                                    </svg>
                                    Düzenle
                                </Link>
                                <button
                                    onClick={handleDeletePost}
                                    disabled={isDeleting}
                                    className="btn-danger px-5 py-2 text-sm inline-flex items-center"
                                >
                                    {isDeleting ? (
                                        <svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                    Sil
                                </button>
                            </div>
                        )}
                    </header>

                    <div className="prose prose-lg max-w-none text-gray-800">
                        {/* Eğer markdown kullanılıyorsa: <ReactMarkdown>{post.content}</ReactMarkdown> */}
                        {formattedContent}
                    </div>
                </div>
            </article>

            {/* Benzer Yazılar Bölümü */}
            {similarPosts && similarPosts.length > 0 && (
                <section className="mt-12">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Benzer Yazılar</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {similarPosts.map(sPost => (
                            <div key={sPost._id} className="card p-4 hover:shadow-xl transition-shadow">
                                <h3 className="text-lg font-semibold mb-2 line-clamp-2">
                                    <Link to={`/posts/${sPost._id}`} className="hover:text-indigo-600">
                                        {sPost.title}
                                    </Link>
                                </h3>
                                {sPost.imageUrl && (
                                     <Link to={`/posts/${sPost._id}`} className="block h-32 overflow-hidden rounded mb-2">
                                        <img src={sPost.imageUrl} alt={sPost.title} className="w-full h-full object-cover"/>
                                    </Link>
                                )}
                                <p className="text-xs text-gray-500 mb-1">Yazar: {sPost.author?.username || 'Bilinmiyor'}</p>
                                <p className="text-xs text-gray-500 mb-2">Kategori: {sPost.category}</p>
                                <p className="text-sm text-gray-600 line-clamp-3">{sPost.excerpt}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

export default PostDetailPage;