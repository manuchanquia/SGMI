const apiUrl = "http://localhost:5000"
const bibliografiaUrl = `${apiUrl}/api/bibliografia`;


export const getBibliografia = async (idPlanificacion, pagina = 1, porPagina = 5, filtros = {}, columnaOrden = 'titulo', direccion = 'desc') => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todo la bibliografia');

    const url = new URL(`${bibliografiaUrl}/planificacion/${idPlanificacion}`);
    url.searchParams.append('pagina', pagina);
    url.searchParams.append('por_pagina', porPagina);

    url.searchParams.append('ordenar_por', columnaOrden);
    url.searchParams.append('direccion', direccion);

    Object.keys(filtros).forEach(key => {
        
        const valor = filtros[key];

        if(valor !== undefined && valor !== null && valor !== "todos") {
            if (key === 'busqueda') {
                url.searchParams.append('busqueda_global', valor);
            } else {
                url.searchParams.append(`filtro_${key}`, valor);
            }

        }
    });
    
    const respuesta = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener la bibliografia. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getLibro = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo un solo libro');
    const respuesta = await fetch(`${bibliografiaUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener el libro. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createBibliografia = async (bibliografiaData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(bibliografiaUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(bibliografiaData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear la bibliografia');
    }
    return response.json();
};

export const updateBibliografia = async (id, bibliografiaData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${bibliografiaUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(bibliografiaData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar el proyecto');
    }
    return response.json();
};

export const deleteBibliografia = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${bibliografiaUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('No se pudo eliminar la bibliografia');
    }
    return response.json();
}
