import React, { useState, useEffect } from 'react';


const ProductForm = ({ product, onSave, onHide }) => {
    const [formData, setFormData] = useState({
        name: '', description: '', categoryId: '', price: '', stock: '', discount: '' // Estado inicial del formulario
    });
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [categories, setCategories] = useState([]);


    // Carga las categorías para el dropdown y así poder seleccionar una al crear/editar producto
    useEffect(() => {
        fetch('http://localhost:4002/categories')
            .then(res => res.json())
            .then(data => setCategories(data.content || []));
    }, []);

    // Si estamos editando, el formulario se llena automáticametne con los datos del producto, luego estos podrán ser modificados
    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                description: product.description,
                categoryId: product.categoryId,
                price: product.price,
                stock: product.stock,
                discount: product.discount || ''
            });
            setImagePreview(`data:image/jpeg;base64,${product.imageBase64}`);
        } else {
            // Si es para crear, reseteamos el formulario
            setFormData({ name: '', description: '', categoryId: '', price: '', stock: '', discount: '' });
            setImagePreview('');
            setImageFile(null);
        }
    }, [product]);

    const handleChange = (e) => { // Maneja cambios en los inputs del formulario
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => { // Maneja la selección de imagen
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => { // Maneja el envío del formulario
        e.preventDefault();
        
        const submissionData = new FormData();
        // El archivo de imagen
        submissionData.append('image', imageFile);
        
        // El objeto JSON con los datos del producto
        const productJson = { ...formData, discount: formData.discount ? parseFloat(formData.discount) : null };
        submissionData.append('product', new Blob([JSON.stringify(productJson)], { type: 'application/json' }));

        onSave(submissionData, product ? product.id : null); // Llama a la función onSave pasada como prop para guardar el producto
    };

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{product ? 'Editar Producto' : 'Crear Producto'}</h5>
                        <button type="button" className="btn-close" onClick={onHide}></button>
                    </div>
                    <div className="modal-body">
                        <form onSubmit={handleSubmit}>
                            <div className="row">
                                <div className="col-md-8">
                                    {/* Campos del formulario */}
                                    <div className="mb-3">
                                        <label>Nombre</label>
                                        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label>Descripción</label>
                                        <textarea name="description" className="form-control" value={formData.description} onChange={handleChange} required></textarea>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Categoría</label>
                                            <select name="categoryId" className="form-select" value={formData.categoryId} onChange={handleChange} required>
                                                <option value="">Seleccionar...</option>
                                                {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.description}</option>)}
                                            </select>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label>Precio</label>
                                            <input type="number" name="price" className="form-control" value={formData.price} onChange={handleChange} required step="0.01" min="0"/>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label>Stock</label>
                                            <input type="number" name="stock" className="form-control" value={formData.stock} onChange={handleChange} required min="0"/>
                                        </div>
                                        <div className="col-md-6 mb-3">
                                            <label>Descuento (ej: 0.10 para 10%)</label>
                                            <input type="number" name="discount" className="form-control" value={formData.discount} onChange={handleChange} step="0.01" min="0" max="0.99"/>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    {/* Input de imagen y preview */}
                                    <label>Imagen</label>
                                    <input type="file" className="form-control" onChange={handleImageChange} accept="image/*" required={!product} />
                                    {imagePreview && <img src={imagePreview} alt="Vista previa" className="img-fluid rounded mt-2" />}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={onHide}>Cancelar</button>
                                <button type="submit" className="btn btn-primary">Guardar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;