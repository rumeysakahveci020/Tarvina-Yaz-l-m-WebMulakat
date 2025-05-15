// frontend/src/features/posts/postsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService.js';

const initialState = {
    posts: [],                // Tüm yazıların listesi (ana sayfa vb. için)
    post: null,               // Tek bir yazı detayı veya yeni oluşturulan/güncellenen yazı
    similarPosts: [],         // Bir yazıya benzer diğer yazılar
    pagination: {             // Sayfalama bilgileri
        page: 1,
        pages: 1, // toplam sayfa sayısı
        count: 0, // toplam yazı sayısı
    },
    isLoading: false,         // Genel yüklenme durumu
    isSubmitting: false,      // Form gönderme (oluşturma/güncelleme) sırasında spesifik yüklenme
    isDeleting: false,        // Silme işlemi sırasında spesifik yüklenme
    isError: false,
    isSuccess: false,         // Genel başarı durumu (örn: oluşturma/güncelleme sonrası)
    message: '',              // Hata veya başarı mesajları için
};

// Yeni bir yazı oluşturmak için asenkron thunk
export const createPost = createAsyncThunk(
    'posts/create',
    async (postData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            if (!token) {
                return thunkAPI.rejectWithValue('Yazı oluşturmak için giriş yapmalısınız.');
            }
            return await postService.createPost(postData, token);
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message || 'Yazı oluşturulurken bir hata oluştu.');
        }
    }
);

// Tüm yayınlanmış yazıları (sayfalama ile) getirmek için asenkron thunk
export const getPosts = createAsyncThunk(
    'posts/getAll',
    async ({ pageNumber = 1, keyword = '', category = '' } = {}, thunkAPI) => { // Varsayılan boş obje
        try {
            return await postService.getPosts(pageNumber, keyword, category);
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message || 'Yazılar yüklenirken bir hata oluştu.');
        }
    }
);

// ID ile tek bir yazıyı getirmek için asenkron thunk
export const getPost = createAsyncThunk(
    'posts/getOne',
    async (postId, thunkAPI) => {
        try {
            return await postService.getPost(postId);
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message || 'Yazı detayı yüklenirken bir hata oluştu.');
        }
    }
);

// Bir yazıyı güncellemek için asenkron thunk
export const updatePost = createAsyncThunk(
    'posts/update',
    async ({ postId, postData }, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            if (!token) {
                return thunkAPI.rejectWithValue('Yazıyı güncellemek için giriş yapmalısınız.');
            }
            return await postService.updatePost(postId, postData, token);
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message || 'Yazı güncellenirken bir hata oluştu.');
        }
    }
);

// Bir yazıyı silmek için asenkron thunk
export const deletePost = createAsyncThunk(
    'posts/delete',
    async (postId, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token;
            if (!token) {
                return thunkAPI.rejectWithValue('Yazıyı silmek için giriş yapmalısınız.');
            }
            await postService.deletePost(postId, token);
            return postId; // Silinen yazının ID'sini döndür (state'ten çıkarmak için)
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message || 'Yazı silinirken bir hata oluştu.');
        }
    }
);

// Benzer yazıları getirmek için asenkron thunk
export const getSimilarPosts = createAsyncThunk(
    'posts/getSimilar',
    async (postId, thunkAPI) => {
        try {
            return await postService.getSimilarPosts(postId);
        } catch (error) {
            const message = (error.response?.data?.message) || error.message || error.toString();
            return thunkAPI.rejectWithValue(message || 'Benzer yazılar yüklenirken bir hata oluştu.');
        }
    }
);


// Post slice'ını oluştur
export const postsSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        resetPostState: (state) => { // Genel state resetleme (örn: sayfadan ayrılırken)
            // initialState'e döndürmek yerine sadece işlem flag'lerini resetleyebiliriz
            // veya bazı kısımları koruyabiliriz. Şimdilik initialState'e döndürelim.
            // Object.assign(state, initialState); // Bu şekilde tüm state'i resetler
            state.post = null;
            state.similarPosts = [];
            state.isLoading = false;
            state.isSubmitting = false;
            state.isDeleting = false;
            state.isError = false;
            state.isSuccess = false;
            state.message = '';
            // state.posts ve state.pagination'ı her zaman resetlemeyebiliriz, duruma göre.
        },
        clearPostMessage: (state) => {
            state.message = '';
            state.isError = false;
            state.isSuccess = false; // Başarı mesajını da temizle
        }
    },
    extraReducers: (builder) => {
        builder
            // createPost
            .addCase(createPost.pending, (state) => {
                state.isSubmitting = true;
                state.message = ''; state.isError = false; state.isSuccess = false;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.isSuccess = true;
                state.post = action.payload; // Yeni oluşturulan post
                // state.posts.unshift(action.payload); // İsteğe bağlı: Listeye en başa ekle
                state.message = 'Yazınız başarıyla yayınlandı!';
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isSubmitting = false;
                state.isError = true;
                state.message = action.payload;
            })
            // getPosts
            .addCase(getPosts.pending, (state) => {
                state.isLoading = true;
                state.message = ''; state.isError = false;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.posts = action.payload.posts;
                state.pagination = {
                    page: action.payload.page,
                    pages: action.payload.pages,
                    count: action.payload.count,
                };
            })
            .addCase(getPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                // state.posts = []; // Hata durumunda listeyi boşaltmak isteğe bağlı
            })
            // getPost
            .addCase(getPost.pending, (state) => {
                state.isLoading = true;
                state.post = null; // Yeni post yüklenirken eskisini temizle
                state.message = ''; state.isError = false;
            })
            .addCase(getPost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.post = action.payload;
            })
            .addCase(getPost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.post = null;
            })
            // updatePost
            .addCase(updatePost.pending, (state) => {
                state.isSubmitting = true;
                state.message = ''; state.isError = false; state.isSuccess = false;
            })
            .addCase(updatePost.fulfilled, (state, action) => {
                state.isSubmitting = false;
                state.isSuccess = true;
                state.post = action.payload; // Güncellenen post
                // Eğer listede varsa, listedeki postu da güncelle
                const index = state.posts.findIndex(p => p._id === action.payload._id);
                if (index !== -1) {
                    state.posts[index] = action.payload;
                }
                state.message = 'Yazınız başarıyla güncellendi!';
            })
            .addCase(updatePost.rejected, (state, action) => {
                state.isSubmitting = false;
                state.isError = true;
                state.message = action.payload;
            })
            // deletePost
            .addCase(deletePost.pending, (state) => {
                state.isDeleting = true;
                state.message = ''; state.isError = false; state.isSuccess = false;
            })
            .addCase(deletePost.fulfilled, (state, action) => {
                state.isDeleting = false;
                state.isSuccess = true; // Genel başarı flag'i kullanılabilir
                // Silinen yazıyı posts listesinden çıkar
                state.posts = state.posts.filter(p => p._id !== action.payload);
                if (state.post && state.post._id === action.payload) {
                    state.post = null; // Eğer detay sayfasında o yazı görüntüleniyorsa
                }
                state.message = 'Yazınız başarıyla silindi.';
            })
            .addCase(deletePost.rejected, (state, action) => {
                state.isDeleting = false;
                state.isError = true;
                state.message = action.payload;
            })
            // getSimilarPosts
            .addCase(getSimilarPosts.pending, (state) => {
                state.isLoading = true; // Veya ayrı bir loading flag'i (örn: isLoadingSimilar)
                state.similarPosts = [];
            })
            .addCase(getSimilarPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                state.similarPosts = action.payload;
            })
            .addCase(getSimilarPosts.rejected, (state, action) => {
                state.isLoading = false;
                // Hata mesajı gösterilebilir ama similarPosts'u boş bırakmak yeterli olabilir
                // state.isError = true;
                // state.message = action.payload;
                state.similarPosts = [];
            });
    },
});

export const { resetPostState, clearPostMessage } = postsSlice.actions;

export default postsSlice.reducer;