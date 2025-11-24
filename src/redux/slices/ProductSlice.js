import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const BASE_URL = 'http://localhost:4002';

// --- THUNKS DE LECTURA (Públicos) ---

export const fetchProducts = createAsyncThunk(
    'products/fetchAll',
    async (filters = {}) => {
        const { category, price_min, price_max, sort } = filters;
        let url;

        if (category) {
            url = new URL(`${BASE_URL}/categories/${category}/products`);
        } else if (price_min && price_max) {
            url = new URL(`${BASE_URL}/products/by-price`);
            url.searchParams.append('minPrice', price_min);
            url.searchParams.append('maxPrice', price_max);
        } else if (sort) {
            url = new URL(`${BASE_URL}/products/sorted-by-price`);
            url.searchParams.append('order', sort);
        } else {
            url = new URL(`${BASE_URL}/products/all`); 
        }

        // Axios hace el get a la URL string construida
        const response = await axios.get(url.toString());
        const data = response.data;
        return data.content || data; 

    }
);


// Hot Sale (Exclusivo para Home)
export const fetchHotSale = createAsyncThunk(
    'products/fetchHotSale',
    async () => {
        const response = await axios.get(`${BASE_URL}/products/discounted`);
        const list = response.data.content || response.data;
        // Retornamos solo los primeros 4 para el Home
        return list.slice(0, 4);
    }
);


// Nuevos Ingresos (Exclusivo para Home)
export const fetchNewArrivals = createAsyncThunk(
    'products/fetchNewArrivals',
    async () => {
        const response = await axios.get(`${BASE_URL}/products`);
        const list = response.data.content || response.data;
        // Ordenamos por ID descendente (simulando "lo último agregado")
        const sorted = [...list].sort((a, b) => b.id - a.id);
        return sorted.slice(0, 4);
    }
);

export const fetchProductById = createAsyncThunk(
    'products/fetchOne',
    async (id) => {
        const response = await axios.get(`${BASE_URL}/products/${id}`);
        // Axios maneja el status 204 como éxito pero sin data, validamos si llegó algo
        if (response.status === 204) throw new Error("Producto no encontrado.");
        return response.data;
    }
);

// --- THUNKS DE ADMINISTRACIÓN (Requieren Token) ---

// 1. CREAR PRODUCTO (Recibe FormData)
export const createProduct = createAsyncThunk(
    'products/create',
    async (formData, { getState }) => {
        const { token } = getState().auth;
        // Axios detecta FormData y configura el Content-Type automáticamente
        const response = await axios.post(`${BASE_URL}/products`, formData, {
            headers: { 
                'Authorization': `Bearer ${token}`
            }
        });
        return response.data; 
    }
);

// 2. ACTUALIZAR / REACTIVAR (Recibe { id, formData })
export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, formData }, { getState }) => {
        const { token } = getState().auth;
        const response = await axios.put(`${BASE_URL}/products/${id}`, formData, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data; 
    }
);

// 3. ELIMINAR PRODUCTO
export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id, { getState }) => {
        const { token } = getState().auth;
        await axios.delete(`${BASE_URL}/products/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        return id;
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
        },
        decreaseStockLocally: (state, action) => {
            const purchasedItems = action.payload; // Lista de items del carrito (con id y quantity)

            purchasedItems.forEach(purchasedItem => {
                const purchasedId = purchasedItem.id;
                const purchasedQuantity = purchasedItem.quantity;

                // Función auxiliar para actualizar una lista específica
                const updateStock = (productList) => {
                    // Usamos map para crear una nueva lista con el estado actualizado (inmutabilidad)
                    return productList.map(item => {
                        if (item.id === purchasedId) {
                            // Calculamos el nuevo stock, asegurándonos que no sea negativo
                            const newStock = item.stock - purchasedQuantity;

                            return { 
                                ...item, 
                                stock: newStock
                            };
                        }
                        return item;
                    });
                };

                // Actualizar todas las listas que muestran productos
                state.list = updateStock(state.list);
                state.hotSaleList = updateStock(state.hotSaleList);
                state.newArrivalsList = updateStock(state.newArrivalsList);
            });
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
                state.error = action.error.message;
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
                state.loadingHome = false; 
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
                const newProduct = action.payload;

                // 1. Agregamos a la lista general (Admin y Productos)
                state.list.push(newProduct);

                // 2. Agregamos a Nuevos Ingresos (Al principio)
                state.newArrivalsList.unshift(newProduct);
                // Mantener solo los ultimos 4
                if (state.newArrivalsList.length > 4) state.newArrivalsList.pop();

                // 3. Si tiene descuento, agregar a Hot Sale
                if (newProduct.discount && newProduct.discount > 0) {
                    state.hotSaleList.unshift(newProduct);
                    if (state.hotSaleList.length > 4) state.hotSaleList.pop();
                }
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = 'error';
                state.error = action.error.message;
            })

            // Update / Reactivate
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.operationStatus = 'pending';
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = 'success';
                const updated = action.payload; 

                // 1. Actualizar en lista general
                const index = state.list.findIndex(p => p.id === updated.id);
                if (index !== -1) state.list[index] = updated;

                // 2. Actualizar en Hot Sale (Si cambio precio/descuento o se reactivó)
                const hotIndex = state.hotSaleList.findIndex(p => p.id === updated.id);
                if (hotIndex !== -1) {
                    // Si ya estaba, lo actualizamos o sacamos si ya no cumple 
                    if (!updated.active || !updated.discount || !updated.stock > 0){
                        state.hotSaleList.splice(hotIndex, 1);
                    } 
                } 
                else if (updated.active && updated.discount > 0 && updated.stock > 0) {
                    // Si no estaba y ahora cumple, lo metemos
                    state.hotSaleList.unshift(updated);

                    if (state.hotSaleList.length > 4) {
                        state.hotSaleList.pop();
                    }
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.operationStatus = 'error';
                state.error = action.error.message;
            })

            // Delete
            .addCase(deleteProduct.fulfilled, (state, action) => {
                const id = action.payload; 

                // 1. En lista general: Soft Delete (Admin lo ve como inactivo)
                const product = state.list.find(p => p.id === id);
                if (product) product.active = false;

                // 2. En Home: Desaparecerlo completamente
                state.hotSaleList = state.hotSaleList.filter(p => p.id !== id);
                state.newArrivalsList = state.newArrivalsList.filter(p => p.id !== id);
            })
    }
});

export const { clearSelectedProduct, resetOperationStatus, decreaseStockLocally } = productSlice.actions;
export default productSlice.reducer;