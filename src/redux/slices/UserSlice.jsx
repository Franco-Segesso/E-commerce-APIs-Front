// src/redux/slices/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

const API = 'http://localhost:4002';

/** 
 * Devuelve el JWT guardado (lo toma de varias claves típicas).
 * Esto permite que los thunks hagan llamadas autenticadas sin depender del Context.
 */
function getToken() {
    return (
    localStorage.getItem('token') ||
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken') ||
    null
    );
}

/** 
 * GET /users/profile
 * Trae los datos del perfil del usuario logueado.
 */
export const fetchProfile = createAsyncThunk(
    'user/fetchProfile',
    async (_, thunkAPI) => {
    try {
    const token = getToken();
    const res = await fetch(`${API}/users/profile`, {
        headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo cargar el perfil');
    }
      return await res.json(); // { id, firstName, lastName, email, ... }
    } catch (err) {
    return thunkAPI.rejectWithValue(err.message || 'Error desconocido');
    }
}
);

/**
 * PUT /users/profile
 * Actualiza nombre y apellido del usuario.
 * payload: { firstName, lastName }
 */
export const updateProfile = createAsyncThunk(
'user/updateProfile',
async (payload, thunkAPI) => {
    try {
    const token = getToken();
    const res = await fetch(`${API}/users/profile`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
        firstName: payload.firstName,
        lastName:  payload.lastName,
        }),
});
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudo actualizar el perfil');
}
      return await res.json(); // perfil actualizado
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message || 'Error desconocido');
    }
}
);

/**
 * GET /users/orders
 * Trae el historial de pedidos del usuario.
 */
export const fetchOrders = createAsyncThunk(
    'user/fetchOrders',
    async (_, thunkAPI) => {
    try {
    const token = getToken();
    const res = await fetch(`${API}/users/orders`, {
        headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'No se pudieron cargar las órdenes');
    }
      return await res.json(); // array de órdenes
    } catch (err) {
        return thunkAPI.rejectWithValue(err.message || 'Error desconocido');
    }
    }
);


export const fetchAllUsers = createAsyncThunk(
    'user/fetchAll',
    async (_, thunkAPI) => {
        try {
            const token = getToken(); // Tu función helper
            const res = await fetch(`${API}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al cargar lista de usuarios');
            const data = await res.json();
            return data.content || data; 
        } catch (err) {
            return thunkAPI.rejectWithValue(err.message);
        }
    }
);

// Estado inicial del slice
const initialState = {
    profile: null,
    loadingProfile: false,
    errorProfile: null,

    savingProfile: false,
    saveError: null,
    saveSuccess: false,

    orders: [],
    loadingOrders: false,
    errorOrders: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
    /** Resetea el flag de éxito del guardado (para ocultar el cartel) */
    resetSaveSuccess(state) {
        state.saveSuccess = false;
    },
    },
    extraReducers: (builder) => {
    // fetchProfile
    builder
        .addCase(fetchProfile.pending, (state) => {
        state.loadingProfile = true;
        state.errorProfile = null;
    })
        .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loadingProfile = false;
        state.profile = action.payload || null;
    })
        .addCase(fetchProfile.rejected, (state, action) => {
        state.loadingProfile = false;
        state.errorProfile = action.payload || 'No fue posible cargar el perfil';
    });

    // updateProfile
    builder
    .addCase(updateProfile.pending, (state) => {
        state.savingProfile = true;
        state.saveError = null;
        state.saveSuccess = false;
    })
    .addCase(updateProfile.fulfilled, (state, action) => {
        state.savingProfile = false;
        state.saveSuccess = true;
        state.profile = action.payload || state.profile; // reflejar cambios
    })
    .addCase(updateProfile.rejected, (state, action) => {
        state.savingProfile = false;
        state.saveError = action.payload || 'No fue posible actualizar el perfil';
    });

    // fetchOrders
    builder
    .addCase(fetchOrders.pending, (state) => {
        state.loadingOrders = true;
        state.errorOrders = null;
    })
    .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loadingOrders = false;
        state.orders = Array.isArray(action.payload) ? action.payload : [];
    })
    .addCase(fetchOrders.rejected, (state, action) => {
        state.loadingOrders = false;
        state.errorOrders = action.payload || 'No fue posible cargar las órdenes';
    });

    builder.addCase(fetchAllUsers.fulfilled, (state, action) => {
    state.list = action.payload; // Asegúrate de tener 'list: []' en initialState
    });
    },
    });

export const { resetSaveSuccess } = userSlice.actions;
export default userSlice.reducer;

// Selectores
export const selectUserProfile    = (state) => state.user.profile;
export const selectLoadingProfile = (state) => state.user.loadingProfile;
export const selectErrorProfile   = (state) => state.user.errorProfile;

export const selectSavingProfile  = (state) => state.user.savingProfile;
export const selectSaveError      = (state) => state.user.saveError;
export const selectSaveSuccess    = (state) => state.user.saveSuccess;

export const selectOrders         = (state) => state.user.orders;
export const selectLoadingOrders  = (state) => state.user.loadingOrders;
export const selectErrorOrders    = (state) => state.user.errorOrders;
