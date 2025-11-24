import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:4002/categories';

// --- THUNKS ---

// 1. Fetch Categories (Público - No necesita token)
export const fetchCategories = createAsyncThunk(
    'categories/fetchAll',
    async () => {
        const response = await axios.get(`${BASE_URL}/all`);
        return response.data.content;
    }
);

// 2. Crear Categoría (Admin - CON TOKEN desde getState)
export const createCategory = createAsyncThunk(
    'categories/create',
    async (categoryData, { getState }) => {
        const { token } = getState().auth; 
        const response = await axios.post(BASE_URL, categoryData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
);


export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, description }, { getState }) => {
        const { token } = getState().auth;
        const response = await axios.put(`${BASE_URL}/${id}`, { description }, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
);

// 3. Eliminar Categoría (Admin - CON TOKEN)
export const deleteCategory = createAsyncThunk(
    'categories/delete',
    async (id, { getState }) => {
        const { token } = getState().auth;
        await axios.delete(`${BASE_URL}/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return id;
    }
);

// 4. Reactivar Categoría (Admin - CON TOKEN)
export const reactivateCategory = createAsyncThunk(
    'categories/reactivate',
    async (category, { getState }) => {
        const { token } = getState().auth;
        await axios.put(`${BASE_URL}/${category.id}`, 
            { description: category.description }, 
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        return category.id;
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
                state.error = action.error.message;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                const index = state.list.findIndex(c => c.id === action.payload.id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                const cat = state.list.find(c => c.id === action.payload);
                if (cat) cat.active = false;
            });
    }
});

export default categorySlice.reducer;