const apiUrl = "http://localhost:5000"
const grupoUrl = `${apiUrl}/api/grupos`;


export const getGrupos = async (pagina = 1, porPagina = 5, filtros = {}, columnaOrden = 'nombre', direccion = 'desc') => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todos los grupos');

    const url = new URL(`${grupoUrl}/`);
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
        headers:{
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener los grupos. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getGrupo = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo un solo grupo');
    const respuesta = await fetch(`${grupoUrl}/${id}`,{
        headers:{
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener el grupo. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createGrupo = async (grupoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${grupoUrl}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(grupoData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear el grupo');
    }
    return response.json();
};

export const updateGrupo = async (id, grupoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${grupoUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(grupoData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar el grupo');
    }
    return response.json();
};

export const deleteGrupo = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${grupoUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    
    if (!response.ok) {
        throw new Error('No se pudo eliminar el grupo');
    }
    return response.json();
};

{/*export const patchGrupo = async (id, datosParciales) => {
    const token = localStorage.getItem("token"); 
    const response = await fetch(`${grupoUrl}/${id}`, {
        method: 'PATCH', 
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosParciales),
    });

    if (!response.ok) {
        throw new Error('No se pudo modificar el estado del grupo');
    }
    return response.json();
};*/}
