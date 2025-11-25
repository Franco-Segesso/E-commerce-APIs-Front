import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

const BASE_URL = 'http://localhost:4002/api/v1/auth';
const USERS_URL = 'http://localhost:4002/users';

// --- 1. THUNKS (Acciones Asíncronas) ---

// Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }) => {
        const response = await axios.post(`${BASE_URL}/authenticate`, { email, password });
        return response.data.access_token;
    }
);

// Register
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData) => {
        const response = await axios.post(`${BASE_URL}/register`, userData);
        return response.data.access_token;
    }
);




// --- 3. SLICE ---

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: null,
        status: 'idle', 
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle'; 
            
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Login
            .addCase(loginUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload;
                const decoded = jwtDecode(action.payload);
                state.user = { email: decoded.sub, roles: decoded.authorities || [] };
                
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })
            
            // Register
            .addCase(registerUser.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload;
                const decoded = jwtDecode(action.payload);
                state.user = { email: decoded.sub, roles: decoded.authorities || [] };
                
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            ;
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;