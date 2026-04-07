import { Navigate, Outlet } from "react-router-dom";
import AppNavbar from "./Navbar";

const RutaPrivada = () => {
    const token = localStorage.getItem("token");

    if (!token){
        return <Navigate to="/login" />;
    }
    return(
        <div>
            <Outlet />
        </div>
    );

};

export default RutaPrivada;