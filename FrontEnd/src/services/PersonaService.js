const apiUrl = "http://localhost:5000"
const personaUrl = `${apiUrl}/api/personas`;


export const getPersonas = async () => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todas las personas');
    const respuesta = await fetch(`${personaUrl}/`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener las personas. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}

export const getPersona = async (id) => {
    const token = localStorage.getItem("token");
    console.log('obteniendo una sola persona');
    const respuesta = await fetch(`${personaUrl}/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener la persona. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
}


export const getPersonaPorDocumento = async (dni) => {
    console.log(`Buscando persona con documento: ${dni}`);
    const respuesta = await fetch(`${personaUrl}/buscar?numero=${dni}`);
    if (respuesta.status === 404) return null;

    if (!respuesta.ok) {
        const errorRespuesta = `Error al buscar persona. Código: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    
    return respuesta.json();
}

export const createPersona = async (personaData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${personaUrl}/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(personaData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear la persona');
    }
    return response.json();
};

export const updatePersona = async (id, personaData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${personaUrl}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json', 
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(personaData),
    });
    if (!response.ok) {
        throw new Error('No se pudo actualizar la persona');
    }
    return response.json();
};
