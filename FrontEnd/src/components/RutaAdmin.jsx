import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const RutaAdmin = () => {
    const token = localStorage.getItem("token");
    
    let esAdmin = false;

    if (token) {
        try {
            const datosUsuario = JSON.parse(atob(token.split('.')[1]));

            esAdmin = datosUsuario.rol === 'superadmin'; 
        } catch (error) {
            console.error("Error al leer el token", error);
        }
    }

    return esAdmin ? <Outlet /> : <Navigate to="/grupo" replace />;
};

export default RutaAdmin;