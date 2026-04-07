const apiUrl = "http://localhost:5000"
const proyectoUrl = `${apiUrl}/api/proyectos`;


export const getProyectos = async (idPlanificacion, pagina=1, porPagina=5, filtros = {}, columnaOrden = 'nombre', direccion = 'desc') => {

    const token = localStorage.getItem("token");
    console.log('obtieniendo todos los proyectos');

    const url = new URL(`${proyectoUrl}/planificacion/${idPlanificacion}`);
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
    })
    
    const respuesta = await fetch(url, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener los proyectos. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getProyecto = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo un solo proyecto');
    const respuesta = await fetch(`${proyectoUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener el proyecto. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createProyecto = async (proyectoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${proyectoUrl}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(proyectoData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear el proyecto');
    }
    return response.json();
};

/*
JSON
{
    "codigo": "P-001",
    "nombre": "Proyecto IA",
    "descripcion": "...",
    "tipo": "I+D",
    "logros": "...",
    "dificultades": "...",
    "fechaInicio": "2024-01-01",
    "fechaFin": "2025-01-01",
    "grupoId": 5
}

*/

export const updateProyecto = async (id, proyectoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${proyectoUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(proyectoData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar el proyecto');
    }
    return response.json();
};

export const deleteProyecto = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${proyectoUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('No se pudo eliminar el proyecto');
    }
    return response.json();
};