import { useNavigate, useParams } from "react-router-dom"
import { Form, Row, Col, InputGroup, Button } from 'react-bootstrap';
import { useState } from "react";
import "./Login.css";
import Boton from "../../components/Boton";
import imagenLogin from "../../images/imagen login.jpeg";
import Image from "react-bootstrap/Image";
import { sileo } from "sileo"

import { loginService } from "../../services/LoginService";

import { Eye, EyeSlash } from 'react-bootstrap-icons';

function Login() {

    const navegar = useNavigate();

    const [email, setEmail] = useState(""); 
    const [clave, setClave] = useState("");
    const [error, setError] = useState("");
    const [mostrarClave, setMostrarClave] = useState(false);

    const manejarLogIn = async () => {

        setError("");
        sileo.promise(loginService(email, clave), {
            loading: {
                title: "Iniciando sesión..."},
            success: (data) => {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    navegar("/grupo");
                    return {title: "Sesión iniciada con éxito"};
                }
            },
            error: (err) => {
                console.error(err)
                setError("Email o contraseña incorrectos");
                return null; 
            },
            
        });
    };

    return (
        <div className="container-fluid login">
            <div className="row container-fluid w-100 justify-content-center align-items-center">
                <div className="col-12 col-lg-4 login-container mb-4 mb-lg-0">
                    <h1 className="titulo-login">SGMI</h1>
                    <p>Sistema de Gestión de Memorias de<br></br> Grupos y Centros de Investigación</p>
                    <h3>¡Bienvenido de vuelta!</h3>
            
                    <Form>
                        <Form.Group className="mb-2" controlId="emailLogin">
                            <Form.Label>Email</Form.Label>
                            <Form.Control 
                                type="email" 
                                placeholder="tumail@ejemplo.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                            />
                        </Form.Group>
                    
                        <Form.Group className="mb-2" controlId="contraseñaLogin">
                            <Form.Label>Contraseña</Form.Label>
                            <InputGroup className="contenedor-password">
                                <Form.Control 
                                    type={mostrarClave ? "text" : "password"}
                                    placeholder="Contraseña"
                                    value={clave}
                                    onChange={(e) => setClave(e.target.value)} 
                                />
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setMostrarClave(!mostrarClave)}
                                    className="boton-ojo"
                                >
                                    {mostrarClave ? <EyeSlash size={20} /> : <Eye size={20} />}
                                </Button>    
                            </InputGroup>
                        </Form.Group>
                    
                        {error && <div className="alert alert-danger">{error}</div>} {/* Mensaje de error visible si falla */}
                        
                        <div className="d-grid mt-4">
                            <Boton 
                                className="boton-iniciar-sesion" 
                                texto={"Iniciar Sesión"} 
                                accion={manejarLogIn}
                            ></Boton>
                        </div>
                    </Form>
                </div>
                <div className="col-lg-6 d-none d-lg-flex imagen">
                    <Image className="imagen-iniciar-sesion" src={imagenLogin} alt="Imagen del login"></Image>
                </div>
            </div>
        </div>
    )
}

export default Login