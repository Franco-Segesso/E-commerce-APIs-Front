import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// --- 1. THUNKS (Acciones Asíncronas) ---

// Login
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            if (!response.ok) throw new Error('Credenciales inválidas');
            const data = await response.json();
            return data.access_token; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Register
export const registerUser = createAsyncThunk(
    'auth/registerUser',
    async (userData, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData),
            });
            if (!response.ok) {
                 const errorData = await response.json().catch(() => null);
                 throw new Error(errorData?.message || 'Error al registrar usuario');
            }
            const data = await response.json();
            return data.access_token;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Check Auth (Verificar Sesión)
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        if (!token) return rejectWithValue('No token');

        try {
            // Consultamos perfil para validar que el token no expiró en el servidor
            const response = await fetch('http://localhost:4002/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Token inválido');

            const userData = await response.json();
            const decoded = jwtDecode(token);
            
            // Retornamos token y usuario fresco
            return { 
                token, 
                user: { 
                    email: userData.email, 
                    roles: decoded.authorities || [] 
                } 
            };
        } catch (error) {
            localStorage.removeItem('token');
            return rejectWithValue(error.message);
        }
    }
);

// --- 2. ESTADO INICIAL ---

const tokenFromStorage = localStorage.getItem('token');
// Intentamos decodificar lo básico solo para tener algo mientras carga
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
        // CORRECCIÓN DEL BUG:
        // Si hay un token guardado, forzamos el estado a 'loading'.
        // Esto evita que las rutas protegidas redirijan antes de tiempo.
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
                state.error = action.payload;
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
                state.error = action.payload;
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
                state.status = 'failed';
                state.user = null;
                state.token = null;
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;