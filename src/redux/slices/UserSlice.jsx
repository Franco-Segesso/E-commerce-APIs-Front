import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- THUNKS ---

// 1. Obtener Perfil (GET)
export const fetchUserProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, { getState, rejectWithValue }) => {
        // "Redux Way": Sacamos el token del estado global de Auth
        const { token } = getState().auth;
        
        try {
            const response = await fetch('http://localhost:4002/users/profile', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) throw new Error('No se pudo cargar el perfil');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. Actualizar Perfil (PUT)
export const updateUserProfile = createAsyncThunk(
    'user/updateProfile',
    async (userData, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        
        try {
            const response = await fetch('http://localhost:4002/users/profile', {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) throw new Error('No se pudo actualizar el perfil');
            return await response.json(); // Devuelve el usuario actualizado
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3. Obtener Órdenes del Usuario (GET)
export const fetchUserOrders = createAsyncThunk(
    'user/fetchOrders',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;

        try {
            const response = await fetch('http://localhost:4002/users/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Error al cargar órdenes');
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 4. Obtener TODOS los usuarios (Solo Admin) - Para AdminOrdersPage
export const fetchAllUsers = createAsyncThunk(
    'user/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch('http://localhost:4002/users', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();
            return data.content || data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- SLICE ---
const userSlice = createSlice({
    name: 'user',
    initialState: {
        profile: null,      // Datos del usuario logueado (Nombre, Apellido, Email)
        orders: [],         // Historial de compras del usuario
        list: [],           // Lista de todos los usuarios (Para uso Admin)
        loading: false,
        error: null,
        operationStatus: null // 'success' | 'error' | null (Para feedbacks de update)
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
                state.profile = action.payload; // Actualizamos el perfil local con la respuesta
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
             });
    }
});

export const { resetOperationStatus, clearUserState, addOrderLocally } = userSlice.actions;

// Selectores exportados para facilitar el uso en componentes
export const selectUserProfile = (state) => state.user.profile;
export const selectUserOrders = (state) => state.user.orders;
export const selectAllUsers = (state) => state.user.list;
export const selectUserLoading = (state) => state.user.loading;

export default userSlice.reducer;