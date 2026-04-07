const apiUrl = "http://localhost:5000";
const usuariosUrl = `${apiUrl}/api/usuarios`;

export const getUsuarios = async (pagina = 1, porPagina = 5, filtros = {}, columnaOrden = 'nombre', direccion = 'desc') => {
    const token = localStorage.getItem("token");
    const url = new URL(`${usuariosUrl}/`);
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
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    if (!respuesta.ok) throw new Error("No se pudo obtener la lista de usuarios");
    return respuesta.json();
};

export const getUsuario = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo un solo usuario');
    const respuesta = await fetch(`${usuariosUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener el usuario. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createUsuario = async (datosUsuario) => {
    const token = localStorage.getItem("token");
    const datosProcesados = {
        ...datosUsuario,
        id_persona: datosUsuario.id_persona === "" ? null : datosUsuario.id_persona
    };
    const respuesta = await fetch(`${usuariosUrl}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosProcesados),
    });
    if (!respuesta.ok) throw new Error("Error al crear el usuario");
    return respuesta.json();
};

export const updateUsuario = async (id, datosActualizados) => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(`${usuariosUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(datosActualizados),
    });
    if (!respuesta.ok) throw new Error("Error al actualizar el usuario");
    return respuesta.json();
};