const apiUrl = "http://localhost:5000"

export const getGradosAcademicos = async () => {
    const token = localStorage.getItem("token");
    console.log('obtieniendo todos los grados academicos');
    const respuesta = await fetch(apiUrl/grados-academicos, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener los grados academicos. Código de estado: ${respuesta.status}`;
        throw new Error(errorRespuesta);
    }
    return respuesta.json();
};

export const createGradoAcademico = async (gradoAcademicoData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(apiUrl/grados-academicos, {
        method: 'POST',
        headers: {
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(gradoAcademicoData),
    });
    if (!response.ok) {
        throw new Error('No se pudo crear el grado academico');
    }
    return response.json();
};

/*{ "nombre": "Doctor" }*/

