// frontend/src/app/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice.js';     // Doğru: app -> features
import postReducer from '../features/posts/postsSlice.js';    // Doğru: app -> features
import battleReducer from '../features/battle/battleSlice.js'; // Doğru: app -> features

export const store = configureStore({
    reducer: {
        auth: authReducer,
        posts: postReducer,
        battle: battleReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});