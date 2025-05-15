// frontend/src/services/battleService.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL;
const BATTLE_API_URL = `${API_BASE_URL}/battles/`;

// Oylama için aktif bir karşılaşma getir
// Token opsiyoneldir; varsa, kullanıcının bu karşılaşmaya oy verip vermediği bilgisi döner.
const getActiveBattle = async (token) => {
    const config = {};
    if (token) {
        config.headers = { Authorization: `Bearer ${token}` };
    }
    const response = await axios.get(BATTLE_API_URL + 'active', config);
    // Backend'den { battle: battleData, userVote: "postId" or null } veya { message: "aktif battle yok", battle: null } dönebilir
    return response.data;
};

// Bir karşılaşmada oy kullan (token gerektirir)
const voteInBattle = async (battleId, postIdVotedFor, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const requestBody = { postIdVotedFor };
    const response = await axios.post(BATTLE_API_URL + `${battleId}/vote`, requestBody, config);
    return response.data; // Genellikle { message: 'Oyunuz başarıyla kaydedildi.', battle: updatedBattleData } döner
};

// Bir karşılaşmanın sonuçlarını getir
const getBattleResults = async (battleId) => {
    const response = await axios.get(BATTLE_API_URL + `${battleId}/results`);
    return response.data; // Battle objesi (oy sayıları ve kazanan bilgisiyle)
};

// (Opsiyonel) Adminin manuel karşılaşma oluşturması için (token gerektirir)
const createBattle = async (battleData, token) => {
    // battleData = { post1Id, post2Id, category (opsiyonel), round (opsiyonel) }
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.post(BATTLE_API_URL + 'create', battleData, config);
    return response.data; // Oluşturulan battle objesi
};

const battleService = {
    getActiveBattle,
    voteInBattle,
    getBattleResults,
    createBattle, // Eğer admin paneli gibi bir yerden kullanılacaksa
};

export default battleService;