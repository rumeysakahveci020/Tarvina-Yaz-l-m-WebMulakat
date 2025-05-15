// frontend/src/features/posts/postSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

const initialState = {
    posts: [], // Tüm yazılar listesi
    post: null, // Tek bir yazı detayı veya yeni oluşturulan yazı
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Create new post
export const createPost = createAsyncThunk(
    'posts/create',
    async (postData, thunkAPI) => {
        try {
            const token = thunkAPI.getState().auth.token; // State'ten token'ı al
            if (!token) {
                return thunkAPI.rejectWithValue('Yetkilendirme token\'ı bulunamadı.');
            }
            return await postService.createPost(postData, token);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get all posts
export const getPosts = createAsyncThunk(
    'posts/getAll',
    async (_, thunkAPI) => {
        try {
            return await postService.getPosts();
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);

// Get single post by ID
export const getPost = createAsyncThunk(
    'posts/getOne',
    async (postId, thunkAPI) => {
        try {
            return await postService.getPost(postId);
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message);
        }
    }
);


export const postSlice = createSlice({
    name: 'posts',
    initialState,
    reducers: {
        resetPostState: (state) => { // Özellikle form gönderimi sonrası state'i sıfırlamak için
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
            // state.post = null; // Yeni yazı oluşturulduktan sonra post'u null yapabiliriz veya listede gösteririz
        },
    },
    extraReducers: (builder) => {
        builder
            // Create Post
            .addCase(createPost.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createPost.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.post = action.payload; // Oluşturulan yazıyı state'e ata
                // state.posts.unshift(action.payload); // Veya listeye en başa ekle
            })
            .addCase(createPost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
            })
            // Get All Posts
            .addCase(getPosts.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getPosts.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.isSuccess = true; // Listelemede success'e gerek olmayabilir
                state.posts = action.payload;
            })
            .addCase(getPosts.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.posts = [];
            })
            // Get Single Post
            .addCase(getPost.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getPost.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.isSuccess = true;
                state.post = action.payload;
            })
            .addCase(getPost.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.post = null;
            });
    },
});

export const { resetPostState } = postSlice.actions;
export default postSlice.reducer;