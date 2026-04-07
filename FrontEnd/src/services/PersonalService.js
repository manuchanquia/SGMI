const apiUrl = "http://localhost:5000"
const personalUrl = `${apiUrl}/api/personal`;

//si bien personal no es un plural, se usa como tal y no tiene singular, asi que para poder distinguir entre el get del personal completo y el de una persona en específico, usé integrante; no uso persona para no marearnos con "Persona" que tiene un service aparte y evitar que se pisen los nombres en el componente

export const getIntegrante = async (id) => {
    const token = localStorage.getItem("token");
    console.log('Obtieniendo el integrante solicitado');
    const respuesta = await fetch(`${personalUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener el integrante requerido. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }

    return respuesta.json();
}

export const getPersonal = async (idPlanificacion, pagina = 1, porPagina = 5, filtros = {}, columnaOrden = 'apellido', direccion = 'desc') => {

    const token = localStorage.getItem("token");
    console.log('Obteniendo el personal');

    const url = new URL(`${personalUrl}/planificacion/${idPlanificacion}`);
    url.searchParams.append('pagina', pagina);
    url.searchParams.append('por_pagina', porPagina);
    url.searchParams.append('ordenar_por', columnaOrden);
    url.searchParams.append('direccion', direccion);

    Object.keys(filtros).forEach(key => {
        const valor = filtros[key];
        if (valor !== undefined && valor !== null && valor !== "" && valor !== "todos" && valor !== "TODOS") {
            if (key === 'busqueda') {
                url.searchParams.append('busqueda_global', valor);
            } else if (key === 'tipo') {
                url.searchParams.append('filtro_objectType', valor.toLowerCase());
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
        const errorRespuesta = `No fue posible obtener el personal. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createPersonal = async (personalData) => {

    const operaciones = {
        "PROFESIONAL": 1,
        "SOPORTE": 2,
        "BECARIO": 3,
        "VISITANTE": 4,
        "INVESTIGADOR":5
    }
    const tipo = personalData.objectType || personalData.tipoPersonal;
    const tipoMayusculas = tipo?.toUpperCase();
    const operacion = operaciones[tipoMayusculas] || 0;

    const token = localStorage.getItem("token");
    const response = await fetch(`${personalUrl}/${operacion}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(personalData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear el integrante');
    }
    return response.json();
};

export const updatePersonal = async (id, personalData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${personalUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(personalData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar la persona');
    }
    return response.json();
};

export const deletePersonal = async (id) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${personalUrl}/${id}`, {
        method: 'DELETE',
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!response.ok) {
        throw new Error('No se pudo eliminar el integrante')
    }
    return response.json();

} 

