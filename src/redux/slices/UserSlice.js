import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { logout } from './AuthSlice'; // <--- IMPORTANTE: Importamos la acción logout

const BASE_URL = 'http://localhost:4002/users';

//THUNKS (Acciones Asíncronas)

// 1. Obtener Perfil (GET)
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { getState }) => {
        const { token } = getState().auth;
        const response = await axios.get(`${BASE_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
);

// 2. Actualizar Perfil (PUT)
export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (userData, { getState }) => {
        const { token } = getState().auth;
        const response = await axios.put(`${BASE_URL}/profile`, userData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
);

// 3. Obtener Órdenes del Usuario (GET)
export const fetchUserOrders = createAsyncThunk(
    'user/fetchOrders',
    async (_, { getState }) => {
        const { token } = getState().auth;
        const response = await axios.get(`${BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
);

// 4. Obtener TODOS los usuarios (Solo Admin)
export const fetchAllUsers = createAsyncThunk(
    'user/fetchAll',
    async (_, { getState }) => {
        const { token } = getState().auth;
        const response = await axios.get(BASE_URL, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = response.data;
        return data.content || data;
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
        operationStatus: null,
        orderStatus: 'idle' // 'idle' | 'loading' | 'succeeded' | 'failed'
    },
    
    //REDUCERS (Acciones Sincrónicas)
    reducers: {
        resetOperationStatus: (state) => {
            state.operationStatus = null;
            state.error = null;
        },
        clearUserState: (state) => {
            state.profile = null;
            state.orders = [];
            state.list = [];
            state.orderStatus = 'idle';
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
                state.error = action.error.message;
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
                state.error = action.error.message;
            })

            // --- Fetch Orders ---
            .addCase(fetchUserOrders.pending, (state) => {
                state.loading = true;
                state.orderStatus = 'loading';
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orderStatus = 'succeeded';
                state.orders = action.payload;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.orderStatus = 'failed';
                state.error = action.error.message;
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
                 state.orderStatus = 'idle';
             });
    }
});

export const { resetOperationStatus, clearUserState, addOrderLocally } = userSlice.actions;

export const selectUserProfile = (state) => state.user.profile;
export const selectUserOrders = (state) => state.user.orders;
export const selectAllUsers = (state) => state.user.list;
export const selectUserLoading = (state) => state.user.loading;

export default userSlice.reducer;