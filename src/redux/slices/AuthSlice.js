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

// Check Auth (Verificar Sesión)
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) return rejectWithValue('No token');

        // Consultamos perfil para validar que el token no expiró en el servidor
        const response = await axios.get(`${USERS_URL}/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const userData = response.data;
        const decoded = jwtDecode(token);
            
        // Retornamos token y usuario fresco
        return { 
            token, 
            user: { 
                email: userData.email, 
                roles: decoded.authorities || [] 
            } 
        }
    }
);

// --- 2. ESTADO INICIAL ---

const tokenFromStorage = localStorage.getItem('token');
let userFromStorage = null;
if (tokenFromStorage) {
    try {
        const decoded = jwtDecode(tokenFromStorage);
        userFromStorage = { email: decoded.sub, roles: decoded.authorities || [] };
    } catch (e) {
        localStorage.removeItem('token');
    }
}

// --- 3. SLICE ---

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: userFromStorage,
        token: tokenFromStorage,
        status: tokenFromStorage ? 'loading' : 'idle', 
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.status = 'idle'; 
            localStorage.removeItem('token');
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
                localStorage.setItem('token', action.payload);
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
                localStorage.setItem('token', action.payload);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(checkAuth.rejected, (state) => {
                localStorage.removeItem('token');
                state.status = 'failed';
                state.user = null;
                state.token = null;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;