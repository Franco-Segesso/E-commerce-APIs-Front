import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:4002';

//THUNKS (Acciones Asíncronas)

// Fetch de TODAS las órdenes (Para AdminOrdersPage)
export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAll',
    async (_, { getState }) => {
        const token = getState().auth.token;
        const response = await axios.get(`${BASE_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const data = response.data;
        return Array.isArray(data) ? data : (data.content || []);
    }
);

// Crear una nueva orden (Para CheckoutPage)
export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData, { getState }) => {
        const token = getState().auth.token;

        const response = await axios.post(`${BASE_URL}/orders`, orderData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    }
);

// --- SLICE ---

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        adminOrders: [],
        currentOrder: null,
        status: 'idle',    
        error: null
    },
    //REDUCERS (Acciones Sincrónicas)
    reducers: {
        resetOrderStatus: (state) => {
            state.status = 'idle';
            state.error = null;
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch All Orders (Admin) ---
            .addCase(fetchAllOrders.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchAllOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.adminOrders = action.payload;
            })
            .addCase(fetchAllOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            })

            // --- Create Order ---
            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message;
            });
    }
});

export const { resetOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;