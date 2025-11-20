import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';

// --- 1. THUNK: LOGIN ---
export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:4002/api/v1/auth/authenticate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                throw new Error('Credenciales inválidas');
            }

            const data = await response.json();
            return data.access_token; 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- 2. THUNK: REGISTER ---
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

// --- 3. THUNK: CHECK AUTH (¡Con export!) ---
export const checkAuth = createAsyncThunk(
    'auth/checkAuth',
    async (_, { rejectWithValue }) => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            return rejectWithValue('No token found');
        }

        try {
            // Verificamos si el token sigue siendo válido consultando el perfil
            const response = await fetch('http://localhost:4002/users/profile', {
                headers: { 
                    'Authorization': `Bearer ${token}` 
                }
            });

            if (!response.ok) {
                throw new Error('Token expirado o inválido');
            }

            const userData = await response.json();
            
            // Decodificamos para obtener roles si no vienen en el perfil
            const decoded = jwtDecode(token);
            
            return { 
                token, 
                user: { 
                    email: userData.email, 
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    roles: decoded.authorities || [] 
                } 
            };

        } catch (error) {
            localStorage.removeItem('token');
            return rejectWithValue(error.message);
        }
    }
);

// --- 4. SLICE ---
const authSlice = createSlice({
    name: 'auth',
    initialState: {
        user: null,
        token: localStorage.getItem('token'), // Estado inicial tentativo
        loading: true, // Empezamos cargando para esperar a checkAuth
        error: null,
    },
    reducers: {
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.error = null;
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
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload;
                const decoded = jwtDecode(action.payload);
                state.user = { email: decoded.sub, roles: decoded.authorities || [] };
                localStorage.setItem('token', action.payload);
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Register
            .addCase(registerUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(registerUser.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload;
                const decoded = jwtDecode(action.payload);
                state.user = { email: decoded.sub, roles: decoded.authorities || [] };
                localStorage.setItem('token', action.payload);
            })
            .addCase(registerUser.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Check Auth
            .addCase(checkAuth.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.token = action.payload.token;
                state.user = action.payload.user;
            })
            .addCase(checkAuth.rejected, (state) => {
                state.loading = false;
                state.user = null;
                state.token = null;
                // No seteamos error aquí para no mostrar alertas al iniciar la app
            });
    },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;