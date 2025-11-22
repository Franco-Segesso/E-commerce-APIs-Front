import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './AuthSlice'; // <--- IMPORTANTE: Importamos la acción logout

const BASE_URL = 'http://localhost:4002/users';

// --- THUNKS ---

// 1. Obtener Perfil (GET)
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        
        try {
            const response = await axios.get(`${BASE_URL}/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'No se pudo cargar el perfil');
        }
    }
);

// 2. Actualizar Perfil (PUT)
export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (userData, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        
        try {
            const response = await axios.put(`${BASE_URL}/profile`, userData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'No se pudo actualizar el perfil');
        }
    }
);

// 3. Obtener Órdenes del Usuario (GET)
export const fetchUserOrders = createAsyncThunk(
    'user/fetchOrders',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;

        try {
            const response = await axios.get(`${BASE_URL}/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error al cargar órdenes');
        }
    }
);

// 4. Obtener TODOS los usuarios (Solo Admin)
export const fetchAllUsers = createAsyncThunk(
    'user/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await axios.get(BASE_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = response.data;
            return data.content || data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Error al cargar usuarios');
        }
    }
);

// --- SLICE ---
const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null,      
        orders: [],         
        list: [],           
        loading: false,
        error: null,
        operationStatus: null 
    },
    reducers: {
        resetOperationStatus: (state) => {
            state.operationStatus = null;
            state.error = null;
        },
        clearUserState: (state) => {
            state.profile = null;
            state.orders = [];
            state.list = [];
        },
        addOrderLocally: (state, action) => {
            state.orders.push(action.payload);
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch Profile ---
            .addCase(fetchUserProfile.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.profile = action.payload;
            })
            .addCase(fetchUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // --- Update Profile ---
            .addCase(updateUserProfile.pending, (state) => {
                state.loading = true;
                state.operationStatus = 'pending';
            })
            .addCase(updateUserProfile.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = 'success';
                state.profile = action.payload; 
            })
            .addCase(updateUserProfile.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = 'error';
                state.error = action.payload;
            })

            // --- Fetch Orders ---
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

             // --- Fetch All Users (Admin) ---
             .addCase(fetchAllUsers.pending, (state) => { state.loading = true; })
             .addCase(fetchAllUsers.fulfilled, (state, action) => {
                 state.loading = false;
                 state.list = action.payload;
             })
             
             // --- LOGOUT (Limpieza de estado) ---
             .addCase(logout, (state) => {
                 state.profile = null;
                 state.orders = [];
                 state.list = [];
                 state.error = null;
                 state.operationStatus = null;
             });
    }
});

export const { resetOperationStatus, clearUserState, addOrderLocally } = userSlice.actions;

export const selectUserProfile = (state) => state.user.profile;
export const selectUserOrders = (state) => state.user.orders;
export const selectAllUsers = (state) => state.user.list;
export const selectUserLoading = (state) => state.user.loading;

export default userSlice.reducer;