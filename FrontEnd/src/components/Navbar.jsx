import React, { useMemo } from "react";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { NavDropdown } from "react-bootstrap";
import imagenUser from '../images/user-img.png';
import "./Navbar.css";
import iconoCerrarSesion from '../images/logoCerrarSesion.png';
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";


function AppNavbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const datosUsuario = useMemo(() => {
        const token = localStorage.getItem("token");

        if (!token) {
            return { nombre: "", rol: "" }; 
        }
        
        try {
            const base = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
            const aString = decodeURIComponent(window.atob(base).split('').map(function(c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));

            const aJson = JSON.parse(aString);

            return {
                nombre: aJson.nombre_usuario || aJson.email || "Usuario",
                rol: aJson.rol || "Usuario"
            }
        } catch (error) {
            console.error("Error al decodificar el token:", error);
            return { nombre: "Usuario", rol: "usuario" };
        }
    });
    
    const manejarCerrarSesion = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const linkActual = useLocation()
    const partesUrl = linkActual.pathname.split("/")
    const ultimaParte = partesUrl[partesUrl.length - 1]
    const idActual = !isNaN(ultimaParte) && ultimaParte!== "" ? ultimaParte : null;

    return (
        <Navbar expand="lg" className="bg-body-tertiary" fixed="top">
            <Container fluid>
                <Navbar.Brand className="titulo" href="/grupo">SGMI</Navbar.Brand>
                {location.pathname !== "/login" && (
                    <>
                    <Navbar.Toggle aria-controls="navbarScroll" />
                    <Navbar.Collapse id="navbarScroll">
                        <Nav
                            className="me-auto my-2 my-lg-0"
                            navbarScroll
                        >

                            <Nav.Link className="link" href="/institucion" >Instituciones</Nav.Link>

                        { idActual ? (
                                <>
                                    <Nav.Link as={Link} to={`/proyectos/planificacion/${idActual}`} className="link" >Proyectos</Nav.Link>
                                    <Nav.Link as={Link} to={`/personal/planificacion/${idActual}`} className="link"> Personal </Nav.Link>
                                    <Nav.Link as={Link} to={`/inventario/planificacion/${idActual}`} className="link">Inventario</Nav.Link>
                                </>
                        ) : (
                                <span></span>
                        )}
                        {datosUsuario.rol === 'superadmin' && (
                                    <Nav.Link as={Link} to="/admin/usuarios" className="link">Usuarios</Nav.Link>
                                )}
                        </Nav>
                        <div className="d-flex align-items-center contenedor-usuario-mobile">
                            <div className="me-2 text-white">
                                {datosUsuario.nombre}
                            </div>
                            <NavDropdown title="" className="me-2 custom-dropdown" align="end">
                                <NavDropdown.Item onClick={manejarCerrarSesion}>
                                    <div className="d-flex align-items-center justify-content-between">
                                        <span className="me-2 text-dark">Cerrar Sesion</span>
                                        <img 
                                            className="iconoCerrarSesion" 
                                            src={iconoCerrarSesion} 
                                            alt="icono cerrar sesion" 
                                        />
                                    </div>
                                </NavDropdown.Item>
                            </NavDropdown>
                            <figure className="figure d-none d-lg-block">
                                <img className="imagen-user" src={imagenUser} alt="imagen del perfil del usuario" />
                            </figure>
                        </div>
                    </Navbar.Collapse>
                </>
            )}
            </Container>
        </Navbar>
    );
} export default AppNavbar