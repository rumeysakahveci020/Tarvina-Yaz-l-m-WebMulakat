// frontend/src/pages/EditPostPage.jsx

// import React from 'react';
import { useState, useEffect} from 'react'; // useCallback eklendi
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { getPost, updatePost, resetPostState} from '../features/posts/postsSlice.js'; 


// Sabit kategori listesi (backend ile senkronize olmalı veya backend'den çekilmeli)
const CATEGORIES = ['Teknoloji', 'Gezi', 'Yemek', 'Sanat', 'Edebiyat', 'Yaşam', 'Kişisel Gelişim', 'Spor', 'Diğer'];
const STATUS_OPTIONS = [ // Yazı durumları
    { value: 'yayinda', label: 'Yayında' },
    { value: 'taslak', label: 'Taslak' },
    // { value: 'arsivlendi', label: 'Arşivlendi' }, // Belki sadece admin için
];


function EditPostPage() {
    const { postId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { post: currentPost, isLoading, isError, isSuccess, message } = useSelector(
        (state) => state.posts
    );

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [excerpt, setExcerpt] = useState('');
    const [category, setCategory] = useState(CATEGORIES[0]);
    const [imageUrl, setImageUrl] = useState('');
    const [status, setStatus] = useState('yayinda');
    const [initialLoading, setInitialLoading] = useState(true); // Sayfa ilk yüklendiğinde veri çekme durumu

    // Yazı verilerini yükle
    useEffect(() => {
        // dispatch(clearPostError()); // Önceki hataları temizle (opsiyonel)
        if (postId) {
            setInitialLoading(true);
            dispatch(getPost(postId))
                .unwrap()
                .catch(() => setInitialLoading(false)) // Hata durumunda da yüklemeyi bitir
                .finally(() => setInitialLoading(false));
        }
        // Sayfadan ayrılırken post state'ini resetle
        return () => {
            dispatch(resetPostState());
        }
    }, [dispatch, postId]);

    // Yüklenen yazı verileriyle formu doldur
    useEffect(() => {
        if (currentPost && currentPost._id === postId) {
            // Kullanıcı bu yazının sahibi mi veya admin mi kontrol et
            // (Backend bu kontrolü zaten yapıyor ama frontend'de de önlem almak iyi olabilir)
            const authorId = currentPost.author?._id || currentPost.author; // author populate edilmiş veya sadece ID olabilir
            if (loggedInUser && authorId && loggedInUser._id !== authorId /* && loggedInUser.role !== 'admin' */) {
                alert('Bu yazıyı düzenleme yetkiniz bulunmamaktadır.');
                navigate(`/posts/${postId}`); // Yazı detayına geri dön
                return;
            }
            setTitle(currentPost.title || '');
            setContent(currentPost.content || '');
            setExcerpt(currentPost.excerpt || '');
            setCategory(currentPost.category || CATEGORIES[0]);
            setImageUrl(currentPost.imageUrl || '');
            setStatus(currentPost.status || 'yayinda');
        }
    }, [currentPost, postId, loggedInUser, navigate]);

    // Güncelleme sonrası veya hata durumunda
    useEffect(() => {
        if (isError && message && !initialLoading && !isLoading) { // Sadece güncelleme hatasıysa göster
            alert(`Güncelleme Hatası: ${message}`);
            // dispatch(resetPostState()); // Hata mesajını temizle
        }
        if (isSuccess && currentPost && currentPost._id === postId && !isLoading && !initialLoading) {
            alert('Yazınız başarıyla güncellendi!');
            navigate(`/posts/${postId}`); // Güncellenen yazının detay sayfasına git
        }
        // isSuccess veya isError değiştiğinde state'i resetlemek için cleanup
        // return () => {
        //     if(isSuccess || isError) dispatch(resetPostState());
        // }
    }, [isError, isSuccess, message, navigate, dispatch, currentPost, postId, isLoading, initialLoading]);


    const handleSubmit = (e) => {
        e.preventDefault();
        dispatch(resetPostState()); // Önceki işlem sonuçlarını temizle
        if (!title.trim() || !content.trim() || !excerpt.trim() || !category) {
            alert('Lütfen tüm zorunlu alanları (* ile işaretli) doldurun.');
            return;
        }
        // Diğer validasyonlar (CreatePostPage'deki gibi) eklenebilir
        const postData = {
            title,
            content,
            excerpt,
            category,
            imageUrl,
            status
        };
        dispatch(updatePost({ postId, postData }));
    };

    if (initialLoading) {
        return <div className="text-center mt-12 text-xl text-gray-600">Yazı bilgileri yükleniyor...</div>;
    }

    if (!currentPost && !initialLoading && isError) { // Yazı bulunamadıysa (getPost hatası)
        return (
            <div className="text-center mt-12">
                <p className="text-xl text-red-500">{message || 'Düzenlenecek yazı bulunamadı veya yüklenirken bir hata oluştu.'}</p>
                <Link to="/" className="mt-4 btn-secondary px-6 py-2 inline-block">Ana Sayfaya Dön</Link>
            </div>
        );
    }
    if (!currentPost) return null; // Eğer hala post yoksa bir şey gösterme (nadiren olmalı)


    return (
        <div className="max-w-3xl mx-auto p-6 sm:p-8 bg-white shadow-xl rounded-xl">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center border-b pb-4">
                Yazıyı Düzenle: <em className="text-indigo-600">{currentPost.title}</em>
            </h1>
             {/* isLoading (güncelleme işlemi sırasında) && <div className="text-center text-sm text-indigo-600 mb-4">Değişiklikler kaydediliyor...</div> */}
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Başlık <span className="text-red-500">*</span></label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required minLength="5" maxLength="100" className="input-style" disabled={isLoading}/>
                </div>
                <div>
                    <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">Özet <span className="text-red-500">*</span></label>
                    <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows="3" required minLength="10" maxLength="250" className="input-style" disabled={isLoading}></textarea>
                    <p className="text-xs text-gray-500 mt-1 text-right">{excerpt.length}/250 karakter</p>
                </div>
                <div>
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">İçerik <span className="text-red-500">*</span> (En az 50 karakter)</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="12" required minLength="50" className="input-style" disabled={isLoading}></textarea>
                </div>
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">Kategori <span className="text-red-500">*</span></label>
                    <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} required className="select-style" disabled={isLoading}>
                        {CATEGORIES.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>
                <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">Görsel URL'i</label>
                    <input type="url" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://ornek.com/gorsel.jpg" className="input-style" disabled={isLoading}/>
                </div>
                 <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">Yazı Durumu</label>
                    <select id="status" value={status} onChange={(e) => setStatus(e.target.value)} className="select-style" disabled={isLoading}>
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="pt-4 flex space-x-3">
                    <button type="submit" disabled={isLoading} className="btn-primary flex-1 py-3 text-base font-semibold">
                        {isLoading ? (
                            <svg className="animate-spin h-5 w-5 text-white mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Değişiklikleri Kaydet'}
                    </button>
                    <Link to={currentPost ? `/posts/${currentPost._id}` : '/'} className="btn-secondary flex-1 py-3 text-base font-semibold text-center">
                        İptal
                    </Link>
                </div>
            </form>
        </div>
    );
}

export default EditPostPage;