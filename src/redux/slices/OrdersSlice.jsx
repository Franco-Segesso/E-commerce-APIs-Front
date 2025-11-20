import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- THUNKS (Acciones Asíncronas) ---

// 1. Fetch de órdenes del usuario logueado (Para ProfilePage)
// GET /users/orders
export const fetchUserOrders = createAsyncThunk(
    'orders/fetchUserOrders',
    async (_, { getState, rejectWithValue }) => {
        // Obtenemos el token del estado de auth
        const token = getState().auth.token;
        
        if (!token) return rejectWithValue("No hay token de autenticación");

        try {
            const response = await fetch('http://localhost:4002/users/orders', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('No se pudo cargar el historial de órdenes.');
            }

            const data = await response.json();
            // Dependiendo de si tu back devuelve una lista directa o un objeto paginado
            return Array.isArray(data) ? data : (data.content || []); 
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. Fetch de TODAS las órdenes (Para AdminOrdersPage)
// GET /orders
export const fetchAllOrders = createAsyncThunk(
    'orders/fetchAll',
    async (_, { getState, rejectWithValue }) => {
        const token = getState().auth.token;

        try {
            const response = await fetch('http://localhost:4002/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                if (response.status === 403) throw new Error("Acceso denegado.");
                throw new Error('Error al cargar órdenes del sistema.');
            }

            const data = await response.json();
            return Array.isArray(data) ? data : (data.content || []);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3. Crear una nueva orden (Para CheckoutPage)
// POST /orders
export const createOrder = createAsyncThunk(
    'orders/create',
    async (orderData, { getState, rejectWithValue }) => {
        const token = getState().auth.token;

        try {
            const response = await fetch('http://localhost:4002/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(orderData)
            });
            
            if (!response.ok) {
                if (response.status === 403) throw new Error("No tienes permisos para realizar compras.");
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || "No se pudo procesar la orden.");
            }

            const createdOrder = await response.json();
            return createdOrder;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- SLICE ---

const ordersSlice = createSlice({
    name: 'orders',
    initialState: {
        myOrders: [],      // Lista para el usuario normal
        adminOrders: [],   // Lista global para el admin
        currentOrder: null,// Última orden creada exitosamente
        status: 'idle',    // 'idle' | 'loading' | 'succeeded' | 'failed'
        error: null
    },
    reducers: {
        // Acción para limpiar el estado después de una compra exitosa (opcional)
        resetOrderStatus: (state) => {
            state.status = 'idle';
            state.error = null;
            state.currentOrder = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // --- Fetch User Orders ---
            .addCase(fetchUserOrders.pending, (state) => {
                state.status = 'loading';
                state.error = null;
            })
            .addCase(fetchUserOrders.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.myOrders = action.payload;
            })
            .addCase(fetchUserOrders.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            })

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
                state.error = action.payload || action.error.message;
            })

            // --- Create Order ---
            .addCase(createOrder.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(createOrder.fulfilled, (state, action) => {
                state.status = 'succeeded';
                state.currentOrder = action.payload;
                // Opcional: Agregar la orden nueva a la lista local del usuario inmediatamente
                state.myOrders.push(action.payload);
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload || action.error.message;
            });
    }
});

export const { resetOrderStatus } = ordersSlice.actions;
export default ordersSlice.reducer;