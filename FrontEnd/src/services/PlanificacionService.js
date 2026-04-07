const apiUrl = "http://localhost:5000"
const planificacionUrl = `${apiUrl}/api/planificacion`;


export const getPlanificaciones = async (idGrupo) => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todas las planificaciones');
    const respuesta = await fetch(`${planificacionUrl}/grupo/${idGrupo}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener las planificaciones. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getPlanificacion = async (idPlanificacion) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo una sola planificacion');
    const respuesta = await fetch(`${planificacionUrl}/${idPlanificacion}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener la planificacion. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const createPlanificacion = async (idGrupo, anio) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${planificacionUrl}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            grupoId: idGrupo, 
            anio: anio
        }),
    });

    if (!response.ok) {
        const errorData = await response.json(); 
        throw new Error(errorData.mensaje || 'No se pudo crear la planificacion');
    }
    return response.json()
}

export const updatePlanificacion = async (id, planificacionData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${planificacionUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(planificacionData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar la planificacion');
    }
    return response.json();
};

