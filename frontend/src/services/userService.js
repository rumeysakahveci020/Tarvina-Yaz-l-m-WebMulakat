import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL + '/users/';

// Get user profile by ID
const getUserProfile = async (userId) => {
    const response = await axios.get(API_URL + userId);
    return response.data; // { user, posts } dönecek şekilde ayarlanmıştı backend
};

// Update logged-in user's profile
const updateUserProfile = async (profileData, token) => {
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
    const response = await axios.put(API_URL + 'profile', profileData, config);
    return response.data;
};

const userService = {
    getUserProfile,
    updateUserProfile,
};

export default userService;