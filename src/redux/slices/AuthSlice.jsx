import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// Helper para decodificar el usuario desde el token
// Esto imita la lógica que tenías en AuthContext
const getUserFromToken = (token) => {
    if (!token) return null;
    try {
        const decoded = jwtDecode(token);
        // Verificamos si el token expiró
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) return null;
        
        return {
            email: decoded.sub, // En tu back, el 'sub' suele ser el email
            roles: decoded.authorities || [] 
        };
    } catch (error) {
        return null;
    }
};

// Helper para estado inicial seguro
const getInitialState = () => {
    const token = localStorage.getItem('token');
    const user = getUserFromToken(token);
    
    // Si el token era inválido o expiró, limpiamos el storage
    if (!user && token) {
        localStorage.removeItem('token');
        return { token: null, user: null };
    }

    return { token, user };
};

const { token: initialToken, user: initialUser } = getInitialState();

// --- THUNKS (Async Actions) ---

// 1. LOGIN: POST /api/v1/auth/authenticate
export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            // data.access_token es lo que esperamos según tu AuthContext
            return data.access_token; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. REGISTER: POST /api/v1/auth/register
export const register = createAsyncThunk(
    'auth/register',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Error en el registro');
            }

            const data = await response.json();
            return data.access_token;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- SLICE ---

const authSlice = createSlice({
    name: 'auth',
    initialState: {
        token: initialToken,
        user: initialUser,
        status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {
        // Reducer Síncrono: LOGOUT
        logout: (state) => {
            state.token = null;
            state.user = null;
            state.status = 'idle';
            state.error = null;
            localStorage.removeItem('token');
        },
        // Reducer Síncrono: CHECK AUTH (Verificar sesión al recargar)
        checkAuth: (state) => {
            const token = localStorage.getItem('token');
            const user = getUserFromToken(token);
            
            if (user) {
                state.token = token;
                state.user = user;
            } else {
                // Si el token no es válido, limpiamos todo
                state.token = null;
                state.user = null;
                localStorage.removeItem('token');
            }
        }
    },
    extraReducers: (builder) => {
        builder
            // Manejo de Login
            .addCase(login.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload;
                state.user = getUserFromToken(action.payload);
                localStorage.setItem('token', action.payload);
            })
            .addCase(login.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al iniciar sesión';
            })

            // Manejo de Register
            .addCase(register.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(register.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.token = action.payload;
                state.user = getUserFromToken(action.payload);
                localStorage.setItem('token', action.payload);
            })
            .addCase(register.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || 'Error al registrarse';
            });
    }
});

export const { logout, checkAuth } = authSlice.actions;
export default authSlice.reducer;