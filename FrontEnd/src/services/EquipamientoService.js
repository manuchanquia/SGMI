const apiUrl = "http://localhost:5000"
const equipamientoUrl = `${apiUrl}/api/equipamiento`;


export const getEquipamiento = async (idPlanificacion, pagina = 1, porPagina = 5, filtros = {}, columnaOrden = 'denominacion', direccion = 'desc') => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todo el equipamiento');

    const url = new URL(`${equipamientoUrl}/planificacion/${idPlanificacion}`);
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
        const errorRespuesta = `No fue posible obtener el equipamiento. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getEquipo = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo un solo equipo');
    const respuesta = await fetch(`${equipamientoUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener el equipo. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createEquipamiento = async (equipamientoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(equipamientoUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(equipamientoData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear el equipamiento');
    }
    return response.json();
};

export const updateEquipamiento = async (id, equipamientoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${equipamientoUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(equipamientoData),
    })
    return response.json();
}

/*
JSON
{
  "denominacion": "Servidor Dell",
  "fecha_ingreso": "2023-05-20",
  "monto": 1500.00,
  "grupo": 5,
  "descripcion": "Servidor principal"
}
*/

export const deleteEquipamiento = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${equipamientoUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar el equipamiento');
    }
    return response.json();
};

{/**
    export const getEstadisticasEquipamiento = async (idGrupo) => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todo el equipamiento');
    const respuesta = await fetch(`${equipamientoUrl}/grupo/${idGrupo}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener las estadisticas del equipamiento. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}
    
    */}