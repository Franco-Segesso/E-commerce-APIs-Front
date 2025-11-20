import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- THUNKS ---

// 1. Fetch Categories (Público - No necesita token)
export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch('http://localhost:4002/categories/all');
            if (!response.ok) throw new Error('Error al cargar categorías');
            const data = await response.json();
            return data.content || data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. Crear Categoría (Admin - CON TOKEN desde getState)
export const createCategory = createAsyncThunk(
    'categories/create',
    async (categoryData, { getState, rejectWithValue }) => {
        // ACÁ ESTÁ LA CLAVE: Usamos getState()
        const { token } = getState().auth; 
        try {
            const response = await fetch('http://localhost:4002/categories', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(categoryData)
            });
            if (!response.ok) throw new Error('Error al crear categoría');
            // Retornamos nada o el mensaje, y luego recargamos la lista
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, description }, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch(`http://localhost:4002/categories/${id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ description })
            });

            if (!response.ok) throw new Error('Error al actualizar categoría');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3. Eliminar Categoría (Admin - CON TOKEN)
export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch(`http://localhost:4002/categories/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al eliminar');
            return id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 4. Reactivar Categoría (Admin - CON TOKEN)
export const reactivateCategory = createAsyncThunk(
    'categories/reactivate',
    async (category, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch(`http://localhost:4002/categories/${category.id}`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({ description: category.description })
            });
            if (!response.ok) throw new Error('Error al reactivar');
            return category.id;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- SLICE ---
const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        list: [],
        loading: false,
        error: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
            // Actualizamos la categoría en la lista localmente
            const index = state.list.findIndex(c => c.id === action.payload.id);
            if (index !== -1) {
                state.list[index] = action.payload;
            }
            })
            // Puedes agregar los casos de create/delete para feedback visual si quieres
            .addCase(deleteCategory.fulfilled, (state, action) => {
                // Actualización local (Optimista/Pesimista)
                const cat = state.list.find(c => c.id === action.payload);
                if (cat) cat.active = false;
            });
    }
});

export default categorySlice.reducer;