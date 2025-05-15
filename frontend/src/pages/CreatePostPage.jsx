// frontend/src/pages/CreatePostPage.jsx

// import React from 'react';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { createPost, resetPostState } from '../features/posts/postsSlice.js';
// import Spinner from '../components/UI/Spinner'; // Opsiyonel

// Sabit kategori listesi (backend ile senkronize olmalı veya backend'den çekilmeli)
const CATEGORIES = ['Teknoloji', 'Gezi', 'Yemek', 'Sanat', 'Edebiyat', 'Yaşam', 'Kişisel Gelişim', 'Spor', 'Diğer'];

function CreatePostPage() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]); // Varsayılan kategori
    const [imageUrl, setImageUrl] = useState(''); // Opsiyonel görsel URL'i

    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Giriş yapmış kullanıcıyı ve post state'ini Redux'tan al
    const { user } = useSelector((state) => state.auth);
    const { post: newlyCreatedPost, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.posts
    );

    useEffect(() => {
        // Eğer kullanıcı giriş yapmamışsa (bu PrivateRoute ile zaten engelleniyor ama ekstra kontrol)
        // Bu kontrol PrivateRoute tarafından yapıldığı için burada gereksiz olabilir.
        // if (!user) {
        //     navigate('/login');
        // }

        if (isError && message) {
            alert(`Yazı Oluşturma Hatası: ${message}`); // Toast ile değiştirilebilir
            dispatch(resetPostState()); // Hata sonrası state'i sıfırla
        }

        if (isSuccess && newlyCreatedPost) { // Yazı başarıyla oluşturulduysa
            alert('Yazınız başarıyla yayınlandı!');
            navigate(`/posts/${newlyCreatedPost._id}`); // Oluşturulan yazının detay sayfasına git
            // dispatch(resetPostState()); // Yönlendirme sonrası cleanup'ta resetlenebilir
        }

        // Sayfadan ayrılırken veya işlem bittiğinde post state'ini temizle
        return () => {
            if (isSuccess || isError) { // Sadece işlem tamamlandığında resetle
                 dispatch(resetPostState());
            }
        };
    }, [user, newlyCreatedPost, isError, isSuccess, message, navigate, dispatch]);

    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(resetPostState()); // Önceki hataları temizle
        if (!title.trim() || !content.trim() || !excerpt.trim() || !category) {
            alert('Lütfen tüm zorunlu alanları (* ile işaretli) doldurun.');
            return;
        }
        if (title.length < 5 || title.length > 100) {
            alert('Başlık 5 ile 100 karakter arasında olmalıdır.');
            return;
        }
        if (excerpt.length < 10 || excerpt.length > 250) {
            alert('Özet 10 ile 250 karakter arasında olmalıdır.');
            return;
        }
        if (content.length < 50) {
            alert('İçerik en az 50 karakter olmalıdır.');
            return;
        }

        const postData = {
            title,
            content,
            excerpt,
            category,
            imageUrl, // Eğer boşsa backend bunu handle eder
        };
        dispatch(createPost(postData));
    };

    // if (isLoading) {
    //     return <Spinner />; // Veya form içinde bir yükleniyor göstergesi
    // }

    return (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white shadow-xl rounded-xl"> {/* Stil güncellendi */}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
                Yeni Bir Yazı Oluştur
            </h1>
            {/* isLoading && <div className="text-center text-sm text-indigo-600 mb-4">Yazı yayınlanıyor...</div> */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                        Başlık <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        minLength="5"
                        maxLength="100"
                        className="input-style"
                        placeholder="Etkileyici bir başlık girin"
                        disabled={isLoading}
                    />
                </div>
                <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                        Özet (Kısa Açıklama) <span className="text-red-500">*</span>
                    </label>
                    <textarea
                        id="excerpt"
                        value={excerpt}
                        onChange={(e) => setExcerpt(e.target.value)}
                        rows="3"
                        required
                        minLength="10"
                        maxLength="250"
                        className="input-style"
                        placeholder="Yazınızın merak uyandıran kısa bir özeti"
                        disabled={isLoading}
                    ></textarea>
                     <p className="text-xs text-gray-500 mt-1 text-right">{excerpt.length}/250 karakter</p>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                        İçerik <span className="text-red-500">*</span> (En az 50 karakter)
                    </label>
                    <textarea
                        id="content"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        rows="12" // Satır sayısı artırıldı
                        required
                        minLength="50"
                        className="input-style"
                        placeholder="Harika fikirlerinizi buraya yazın..."
                        disabled={isLoading}
                    ></textarea>
                    {/* İleride buraya bir Markdown editörü veya WYSIWYG editör eklenebilir. */}
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                        Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        required
                        className="select-style"
                        disabled={isLoading}
                    >
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                        Görsel URL'i (Opsiyonel)
                    </label>
                    <input
                        type="url"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://ornek.com/gorsel.jpg"
                        className="input-style"
                        disabled={isLoading}
                    />
                    {/* İleride direkt dosya yükleme özelliği eklenebilir (Multer vb.) */}
                </div>
                <div className="pt-4"> {/* Buton için biraz boşluk */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn-primary w-full py-3 text-base font-semibold" // Stil güncellendi
                    >
                        {isLoading ? (
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Yazıyı Yayınla'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default CreatePostPage;