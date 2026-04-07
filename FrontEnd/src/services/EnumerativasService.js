const apiUrl = "http://localhost:5000"
const enumerativasUrl = `${apiUrl}/api/enumerativas`;

export const getEnumerativas = async() => {
    const token = localStorage.getItem("token");
    const respuesta = await fetch(enumerativasUrl, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if(!respuesta.ok) {
        const errorRespuesta = `No fue posible obtener los grupos. Codigo de estado: ${respuesta.status}`
        throw new Error(errorRespuesta)
    }
    return respuesta.json()
}

