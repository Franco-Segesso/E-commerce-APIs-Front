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
                state.error = action.payload;
            })

            // Update / Reactivate
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
                state.operationStatus = 'pending';
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.operationStatus = 'success';
                const updated = action.payload; // El producto actualizado que devuelve el back

                // 1. Actualizar en lista general
                const index = state.list.findIndex(p => p.id === updated.id);
                if (index !== -1) state.list[index] = updated;

                // 2. Actualizar en Hot Sale (Si cambio precio/descuento o se reactivó)
                const hotIndex = state.hotSaleList.findIndex(p => p.id === updated.id);
                if (hotIndex !== -1) {
                    // Si ya estaba, lo actualizamos o sacamos si ya no cumple (ej: active false o sin descuento)
                    if (!updated.active || !updated.discount || !updated.stock > 0){
                        state.hotSaleList.splice(hotIndex, 1);
                    } 
                    /*else{
                        state.hotSaleList[hotIndex] = updated;
                    } */
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
                state.error = action.payload;
            })

            // Delete
            .addCase(deleteProduct.fulfilled, (state, action) => {
                const id = action.payload; // El ID eliminado

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