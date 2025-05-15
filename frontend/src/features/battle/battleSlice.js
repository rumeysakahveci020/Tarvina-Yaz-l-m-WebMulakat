// frontend/src/features/battle/battleSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import battleService from '../../services/battleService.js'; // battleService.js dosyasının doğru yolda olduğundan emin ol

const initialState = {
    activeBattle: null,         // Mevcut aktif karşılaşma objesi
    userVote: null,             // Kullanıcının bu karşılaşmada oy verdiği yazı ID'si (string) veya null
    isLoading: false,           // Genel yüklenme durumu (örn: aktif karşılaşma çekilirken)
    isVoting: false,            // Oy kullanma işlemi sırasında spesifik yüklenme durumu
    isError: false,
    message: '',                // Hata veya başarı mesajları için
};

// Aktif karşılaşmayı getirmek için asenkron thunk
export const getActiveBattle = createAsyncThunk(
    'battle/getActive',
    async (_, thunkAPI) => { // İlk parametre payload (şu an için gerek yok), ikincisi thunkAPI
        try {
            // Kullanıcı token'ını auth state'inden al (eğer varsa)
            // Token, backend'in kullanıcının bu karşılaşmaya oy verip vermediğini anlaması için gönderilebilir.
            const token = thunkAPI.getState().auth.token;
            return await battleService.getActiveBattle(token); // battleService'deki fonksiyonu çağır
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            // Backend'den "aktif battle yok" mesajı gelirse, bunu hata olarak değil, normal bir durum olarak ele alabiliriz.
            if (message === 'Şu an aktif bir karşılaşma bulunmuyor.') {
                return thunkAPI.fulfillWithValue({ battle: null, userVote: null, message }); // Başarılı ama boş sonuç
            }
            return thunkAPI.rejectWithValue(message || 'Aktif karşılaşma yüklenirken bir hata oluştu.');
        }
    }
);

// Bir karşılaşmada oy kullanmak için asenkron thunk
export const voteInBattle = createAsyncThunk(
    'battle/vote',
    async ({ battleId, postIdVotedFor }, thunkAPI) => { // Gerekli parametreleri payload olarak al
        try {
            const token = thunkAPI.getState().auth.token;
            if (!token) {
                // Eğer kullanıcı giriş yapmamışsa, burada hata döndür
                return thunkAPI.rejectWithValue('Oy kullanmak için lütfen giriş yapın.');
            }
            const response = await battleService.voteInBattle(battleId, postIdVotedFor, token);
            // Başarılı oylama sonrası backend'den dönen güncel karşılaşma verisini ve kullanıcının oyunu payload olarak döndür
            return { updatedBattle: response.battle, votedFor: postIdVotedFor, message: response.message || 'Oyunuz başarıyla kaydedildi!' };
        } catch (error) {
            const message =
                (error.response && error.response.data && error.response.data.message) ||
                error.message ||
                error.toString();
            return thunkAPI.rejectWithValue(message || 'Oylama sırasında bir hata oluştu.');
        }
    }
);

// Battle slice'ını oluştur
export const battleSlice = createSlice({
    name: 'battle', // Slice'ın adı (state'te state.battle olarak erişilecek)
    initialState,   // Başlangıç state'i
    reducers: {
        // Senkron action'lar için (örn: state'i resetlemek)
        resetBattleState: (state) => {
            state.activeBattle = null;
            state.userVote = null;
            state.isLoading = false;
            state.isVoting = false;
            state.isError = false;
            state.message = '';
        },
        clearBattleMessage: (state) => { // Mesajı temizlemek için (opsiyonel)
            state.message = '';
            state.isError = false; // Hatayı da temizle
        }
        // Oylama sonrası anlık güncellemeler için (eğer WebSocket yoksa ve arayüzde manuel güncelleme gerekiyorsa)
        // updateBattleVotesLocally: (state, action) => {
        //     if (state.activeBattle && state.activeBattle._id === action.payload.battleId) {
        //         state.activeBattle.votesPost1 = action.payload.votesPost1;
        //         state.activeBattle.votesPost2 = action.payload.votesPost2;
        //         state.userVote = action.payload.votedFor; // Kullanıcının oyunu da güncelle
        //     }
        // }
    },
    extraReducers: (builder) => {
        // Asenkron thunk'ların durumlarına göre state'i güncelle
        builder
            // getActiveBattle Thunk Durumları
            .addCase(getActiveBattle.pending, (state) => {
                state.isLoading = true;
                state.message = ''; // Yükleme başlarken mesajı temizle
                state.isError = false;
            })
            .addCase(getActiveBattle.fulfilled, (state, action) => {
                state.isLoading = false;
                state.activeBattle = action.payload.battle; // Backend'den gelen karşılaşma verisi
                state.userVote = action.payload.userVote;   // Backend'den gelen kullanıcı oyu bilgisi
                state.message = action.payload.message || ''; // "Aktif battle yok" mesajı gelebilir
                state.isError = !action.payload.battle && action.payload.message === 'Şu an aktif bir karşılaşma bulunmuyor.' ? false : false; // Hata değilse false
            })
            .addCase(getActiveBattle.rejected, (state, action) => {
                state.isLoading = false;
                state.isError = true;
                state.message = action.payload; // Hata mesajı
                state.activeBattle = null;
                state.userVote = null;
            })
            // voteInBattle Thunk Durumları
            .addCase(voteInBattle.pending, (state) => {
                state.isVoting = true; // Oy kullanma işlemi için ayrı yüklenme durumu
                state.message = '';
                state.isError = false;
            })
            .addCase(voteInBattle.fulfilled, (state, action) => {
                state.isVoting = false;
                // Eğer aktif karşılaşma backend'den dönen güncel karşılaşma ile aynıysa, state'i güncelle
                if (state.activeBattle && action.payload.updatedBattle && state.activeBattle._id === action.payload.updatedBattle._id) {
                    state.activeBattle.votesPost1 = action.payload.updatedBattle.votesPost1;
                    state.activeBattle.votesPost2 = action.payload.updatedBattle.votesPost2;
                }
                state.userVote = action.payload.votedFor; // Kullanıcının kime oy verdiğini state'e kaydet
                state.message = action.payload.message;   // Başarı mesajı
                state.isError = false;
            })
            .addCase(voteInBattle.rejected, (state, action) => {
                state.isVoting = false;
                state.isError = true;
                state.message = action.payload; // Hata mesajı (örn: "Zaten oy kullandınız")
            });
    },
});

// Oluşturulan action creator'ları export et
export const { resetBattleState, clearBattleMessage } = battleSlice.actions;

// Reducer'ı export et (store'da kullanılacak)
export default battleSlice.reducer;