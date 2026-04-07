const apiUrl = "http://localhost:5000"
const institucionUrl = `${apiUrl}/api/institucion`;


export const getInstituciones = async (pagina = null, porPagina = null, filtros = {}, columnaOrden = 'nombre', direccion = 'desc') => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todas las instituciones');

    const url = new URL(`${institucionUrl}/`);
    if(pagina){
        url.searchParams.append('pagina', pagina);
    } 
    if(porPagina){
        url.searchParams.append('por_pagina', porPagina);
    }
    
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
    })

    const respuesta = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener las instituciones. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getInstitucion = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo una sola institucion');
    const respuesta = await fetch(`${institucionUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener la institucion. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createInstitucion = async (institucionData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${institucionUrl}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(institucionData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear la institucion');
    }
    return response.json();
};

export const updateInstitucion = async (id, institucionData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${institucionUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(institucionData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar la institucion');
    }
    return response.json();
};

export const deleteInstitucion = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${institucionUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('No se pudo eliminar la institucion')
    }
    return response.json();
}