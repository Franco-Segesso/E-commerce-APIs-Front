import React, { useState } from 'react';

const SearchBar = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    // Esta función se llama cada vez que el usuario escribe algo
    const handleInputChange = (e) => {
        setQuery(e.target.value);
        onSearch(e.target.value); // Pasamos el valor de búsqueda al componente padre en tiempo real
    };

    return (
        <form className="d-flex" onSubmit={(e) => e.preventDefault()}>
            <input
                className="form-control me-2"
                type="search"
                placeholder="Buscar por nombre..."
                value={query}
                onChange={handleInputChange}
            />
        </form>
    );
};

export default SearchBar;