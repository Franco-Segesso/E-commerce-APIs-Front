import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// --- THUNKS DE LECTURA (Públicos) ---

export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (filters = {}, { rejectWithValue }) => {
        try {
            const { category, price_min, price_max, sort } = filters;
            let url;

            if (category) {
                url = new URL(`http://localhost:4002/categories/${category}/products`);
            } else if (price_min && price_max) {
                url = new URL('http://localhost:4002/products/by-price');
                url.searchParams.append('minPrice', price_min);
                url.searchParams.append('maxPrice', price_max);
            } else if (sort) {
                url = new URL('http://localhost:4002/products/sorted-by-price');
                url.searchParams.append('order', sort);
            } else {
                // Endpoint para traer TODOS (incluidos inactivos) si es admin, o la lista normal
                // Aquí usamos /products/all para admin o /products para público. 
                // Por simplicidad usamos el genérico, el backend filtra por stock/active.
                // Si estás en el panel de admin, quizás quieras llamar a /products/all explícitamente.
                url = new URL('http://localhost:4002/products/all'); 
            }

            const response = await fetch(url.toString());
            if (!response.ok) throw new Error('Error al cargar productos');
            
            const data = await response.json();
            return data.content || data; 

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// Hot Sale (Exclusivo para Home)
export const fetchHotSale = createAsyncThunk(
    'products/fetchHotSale',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("http://localhost:4002/products/discounted");
            if (!response.ok) throw new Error("Error al cargar Hot Sale");
            const data = await response.json();
            const list = data.content || data;
            // Retornamos solo los primeros 4 para el Home
            return list.slice(0, 4);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// Nuevos Ingresos (Exclusivo para Home)
export const fetchNewArrivals = createAsyncThunk(
    'products/fetchNewArrivals',
    async (_, { rejectWithValue }) => {
        try {
            const response = await fetch("http://localhost:4002/products");
            if (!response.ok) throw new Error("Error al cargar Nuevos Ingresos");
            const data = await response.json();
            const list = data.content || data;
            // Ordenamos por ID descendente (simulando "lo último agregado")
            const sorted = [...list].sort((a, b) => b.id - a.id);
            return sorted.slice(0, 4);
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchOne',
    async (id, { rejectWithValue }) => {
        try {
            const response = await fetch(`http://localhost:4002/products/${id}`);
            if (response.status === 204) throw new Error("Producto no encontrado.");
            if (!response.ok) throw new Error('Error al cargar el producto');
            return await response.json();
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// --- THUNKS DE ADMINISTRACIÓN (Requieren Token) ---

// 1. CREAR PRODUCTO (Recibe FormData)
export const createProduct = createAsyncThunk(
    'products/create',
    async (formData, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch('http://localhost:4002/products', {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                    // NO poner 'Content-Type': 'multipart/form-data' explícitamente,
                    // el navegador lo pone solo con el boundary correcto al usar FormData.
                },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al crear producto');
            }
            
            // Tu backend devuelve 201 Created con el producto o mensaje
            // Si devuelve solo mensaje, quizás debamos recargar la lista.
            // Asumiremos que devuelve el objeto creado o recargaremos.
            return await response.json(); 

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 2. ACTUALIZAR / REACTIVAR (Recibe { id, formData })
export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, formData }, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch(`http://localhost:4002/products/${id}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.message || 'Error al actualizar producto');
            }

            const data = await response.json();
            // Si el backend devuelve solo un mensaje, retornamos un objeto que sirva para actualizar localmente
            // O simplemente devolvemos el ID para saber qué se actualizó.
            return data; 

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// 3. ELIMINAR PRODUCTO
export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id, { getState, rejectWithValue }) => {
        const { token } = getState().auth;
        try {
            const response = await fetch(`http://localhost:4002/products/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('No se pudo eliminar el producto');
            return id;

        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);


// --- SLICE ---

const productSlice = createSlice({
    name: 'products',
    initialState: {
        list: [],
        hotSaleList: [],
        newArrivalsList: [],
        selectedProduct: null,
        loading: false,
        loadingHome: true,
        error: null,
        operationStatus: null, // Para saber si se creó/editó con éxito en los modales
    },
    reducers: {
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        resetOperationStatus: (state) => {
            state.operationStatus = null;
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fetch All
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.list = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Fetch Hot Sale
            .addCase(fetchHotSale.pending, () => {

            })
            .addCase(fetchHotSale.fulfilled, (state, action) => {
                state.hotSaleList = action.payload;
            })

            // Fetch New Arrivals
            .addCase(fetchNewArrivals.pending, (state) => {
                state.loadingHome = true;
            })
            .addCase(fetchNewArrivals.fulfilled, (state, action) => {
                state.newArrivalsList = action.payload;
                state.loadingHome = false; // Asumimos que este termina el proceso de carga inicial del home
            })
            .addCase(fetchNewArrivals.rejected, (state) => {
                state.loadingHome = false;
            })

            // Fetch One
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.selectedProduct = action.payload;
            })

            // Create
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
                state.operationStatus = 'pending';
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = 'success';
                state.list.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = 'error';
                state.error = action.payload;
            })

            // Update / Reactivate
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.operationStatus = 'pending';
            })
            .addCase(updateProduct.fulfilled, (state) => {
                state.loading = false;
                state.operationStatus = 'success';
                // Aquí también, tras un update exitoso, solemos recargar la lista 
                // o actualizar el ítem específico si tuviéramos el objeto completo.
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = 'error';
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteProduct.fulfilled, (state, action) => {
                // Actualización optimista/local: lo sacamos de la lista de "activos"
                // o lo marcamos como inactivo si tu lista maneja esa propiedad.
                // Dado que el backend hace soft delete (active=false), 
                // lo correcto es buscarlo y cambiarle el estado active a false.
                const product = state.list.find(p => p.id === action.payload);
                if (product) {
                    product.active = false;
                }
            });
    }
});

export const { clearSelectedProduct, resetOperationStatus } = productSlice.actions;
export default productSlice.reducer;