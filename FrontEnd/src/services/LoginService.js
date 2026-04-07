const apiUrl = "http://localhost:5000"

export const loginService = async (email, clave) => {
    try {
        const response = await fetch(`${apiUrl}/api/login/`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: email,
                clave: clave,
            }),
        });
        if (!response.ok){
            throw new Error("Error en las credenciales");            
        }
        const data = await response.json();
        return data;
    } catch(error) {
        throw(error);
    }
};