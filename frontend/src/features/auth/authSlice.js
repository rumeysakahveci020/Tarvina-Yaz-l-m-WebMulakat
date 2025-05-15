// frontend/src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

// Get user from localStorage
const storedUserToken = JSON.parse(localStorage.getItem('userToken'));
const storedUserInfo = JSON.parse(localStorage.getItem('userInfo'));

const initialState = {
    user: storedUserInfo ? storedUserInfo : null, // Kullanıcı bilgileri
    token: storedUserToken ? storedUserToken : null, // Sadece token'ı saklamak daha iyi olabilir
    isError: false,
    isSuccess: false,
    isLoading: false,
    message: '',
};

// Register user (Async Thunk)
export const register = createAsyncThunk('auth/register', async (user, thunkAPI) => {
    try {
        return await authService.register(user);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Login user (Async Thunk)
export const login = createAsyncThunk('auth/login', async (user, thunkAPI) => {
    try {
        return await authService.login(user);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        return thunkAPI.rejectWithValue(message);
    }
});

// Logout user
export const logout = createAsyncThunk('auth/logout', async () => {
    authService.logout(); // Sadece localStorage'dan siler
});

// Get current user details
export const getMe = createAsyncThunk('auth/getme', async (_, thunkAPI) => {
    try {
        const token = thunkAPI.getState().auth.token; // Mevcut token'ı state'ten al
        if (!token) {
            return thunkAPI.rejectWithValue('Token bulunamadı.');
        }
        return await authService.getMe(token);
    } catch (error) {
        const message =
            (error.response && error.response.data && error.response.data.message) ||
            error.message ||
            error.toString();
        // Token süresi dolmuşsa veya geçersizse logout yapabiliriz.
        if (error.response && error.response.status === 401) {
            thunkAPI.dispatch(logout());
        }
        return thunkAPI.rejectWithValue(message);
    }
});


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        reset: (state) => { // Hata, başarı durumlarını sıfırlamak için
            state.isLoading = false;
            state.isSuccess = false;
            state.isError = false;
            state.message = '';
        },
    },
    extraReducers: (builder) => {
        builder
            // Register
            .addCase(register.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload; // API'den dönen kullanıcı bilgisi
                state.token = action.payload.token;
            })
            .addCase(register.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.token = null;
            })
            // Login
            .addCase(login.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isSuccess = true;
                state.user = action.payload;
                state.token = action.payload.token;
            })
            .addCase(login.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload;
                state.user = null;
                state.token = null;
            })
            // Logout
            .addCase(logout.fulfilled, (state) => {
                state.user = null;
                state.token = null;
            })
            // Get Me
            .addCase(getMe.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(getMe.fulfilled, (state, action) => {
                state.isLoading = false;
                // state.isSuccess = true; // Belki burada success'e gerek yok
                state.user = action.payload; // API'den dönen güncel kullanıcı bilgisi
            })
            .addCase(getMe.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true; // Opsiyonel, belki sadece token'ı null yapmak yeterli
                state.message = action.payload;
                // state.user = null; // Token hatası durumunda kullanıcıyı null yapabiliriz
                // state.token = null; // Zaten logout ile hallediliyor
            });
    },
});

export const { reset } = authSlice.actions;
export default authSlice.reducer;