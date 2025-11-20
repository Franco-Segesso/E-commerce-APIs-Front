// src/redux/slices/categorySlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

/* ===========================================================================
   Configuración base de la API
   - VITE_API_URL permite cambiar la URL sin tocar el código.
   - Fallback a http://localhost:4002 si no existe env var.
   ========================================================================== */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4002';

/* ===========================================================================
   Helper: arma las cabeceras con Authorization (si hay token).
   - Intenta leer el token desde Redux auth o desde localStorage como backup.
   - Se usa en endpoints de administración (crear/editar/borrar) que requieren
     autenticación y rol de admin en el backend.
   ========================================================================== */
function buildAuthHeaders(getState) {
  // 1) intenta leer desde el slice auth: state.auth.token
  const tokenFromRedux = getState()?.auth?.token;
  // 2) backup: intenta desde localStorage (si tenés ese flujo)
  const tokenFromLocal = localStorage.getItem('token');
  const token = tokenFromRedux || tokenFromLocal;

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

/* ===========================================================================
   Thunk: fetchCategories
   - Trae TODAS las categorías (GET /categories)
   - Uso típico: cargar la barra de filtros o una lista admin.
   ========================================================================== */
export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  // payloadCreator: no necesita argumentos en este caso
  async (_, { rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/categories`);
      if (!res.ok) {
        // Si la API responde con error, parseamos el mensaje
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.message || 'No se pudieron obtener las categorías.');
      }
      const data = await res.json();
      return data; // array de categorías
    } catch (err) {
      return rejectWithValue(err.message || 'Error de red al obtener categorías.');
    }
  }
);

/* ===========================================================================
   Thunk: createCategory
   - Crea una categoría nueva (POST /categories)
   - Requiere token (admin).
   - Recibe un objeto { name, ... } con los campos que pida tu backend.
   ========================================================================== */
export const createCategory = createAsyncThunk(
  'categories/createCategory',
  async (newCategory, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: buildAuthHeaders(getState),
        body: JSON.stringify(newCategory),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.message || 'No se pudo crear la categoría.');
      }
      const data = await res.json();
      return data; // categoría creada desde el backend (con id)
    } catch (err) {
      return rejectWithValue(err.message || 'Error de red al crear categoría.');
    }
  }
);

/* ===========================================================================
   Thunk: updateCategory
   - Actualiza una categoría (PUT /categories/{id})
   - Requiere token (admin).
   - Recibe un objeto { id, ...campos } para editar.
   ========================================================================== */
export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ id, ...changes }, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'PUT',
        headers: buildAuthHeaders(getState),
        body: JSON.stringify(changes),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.message || 'No se pudo actualizar la categoría.');
      }
      const data = await res.json();
      return data; // categoría actualizada
    } catch (err) {
      return rejectWithValue(err.message || 'Error de red al actualizar categoría.');
    }
  }
);

/* ===========================================================================
   Thunk: deleteCategory
   - Elimina una categoría (DELETE /categories/{id})
   - Requiere token (admin).
   - Recibe el id de la categoría a eliminar.
   ========================================================================== */
export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async (id, { getState, rejectWithValue }) => {
    try {
      const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: buildAuthHeaders(getState),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return rejectWithValue(err.message || 'No se pudo eliminar la categoría.');
      }
      // Muchos backends devuelven 204 sin body. Retornamos el id eliminado.
      return id;
    } catch (err) {
      return rejectWithValue(err.message || 'Error de red al eliminar categoría.');
    }
  }
);

/* ===========================================================================
   Estado inicial del slice
   - items: listado de categorías
   - status: 'idle' | 'loading' | 'succeeded' | 'failed'
   - error: mensajes de error (si los hay)
   ========================================================================== */
const initialState = {
  items: [],
  status: 'idle',
  error: null,
};

/* ===========================================================================
   Slice: categories
   - Maneja los cambios de estado en base a los thunks.
   - Permite resetear el estado manualmente si fuera necesario.
   ========================================================================== */
const categorySlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Acción sync: reinicia el estado a su forma inicial
    resetCategories: () => initialState,
  },
  extraReducers: (builder) => {
    // GET
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload || [];
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Error al cargar categorías.';
      });

    // POST
    builder
      .addCase(createCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        // Agregamos la nueva categoría al array
        state.items.push(action.payload);
      })
      .addCase(createCategory.rejected, (state, action) => {
        state.error = action.payload || 'Error al crear categoría.';
      });

    // PUT
    builder
      .addCase(updateCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        // Reemplazamos el elemento actualizado
        const updated = action.payload;
        const idx = state.items.findIndex((c) => c.id === updated.id);
        if (idx !== -1) state.items[idx] = updated;
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.error = action.payload || 'Error al actualizar categoría.';
      });

    // DELETE
    builder
      .addCase(deleteCategory.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        // Filtramos la categoría eliminada
        const idDeleted = action.payload;
        state.items = state.items.filter((c) => c.id !== idDeleted);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.error = action.payload || 'Error al eliminar categoría.';
      });
  },
});

export const { resetCategories } = categorySlice.actions;

/* ===========================================================================
   Selectores:
   - selectCategories: lista completa
   - selectCategoriesStatus: estado de carga ('idle'...'failed')
   - selectCategoriesError: último error
   ========================================================================== */
export const selectCategories = (state) => state.categories.items;
export const selectCategoriesStatus = (state) => state.categories.status;
export const selectCategoriesError = (state) => state.categories.error;

export default categorySlice.reducer;
