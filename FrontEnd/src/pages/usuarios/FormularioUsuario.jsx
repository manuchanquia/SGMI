import React, { useState, useEffect } from "react";
import { Form, Col, Row, Button, InputGroup} from "react-bootstrap";
import "../../components/Formulario.css";
import { getEnumerativas } from "../../services/EnumerativasService";
import { getPersonaPorDocumento } from "../../services/PersonaService";
import "./Usuarios.css"

import { Eye, EyeSlash } from 'react-bootstrap-icons';

const FormularioUsuario = ({ data, handleChange, modificando, validacion, setValidacion }) => {

    const [enumerativas, setEnumerativas] = useState(null);
    const [key, setKey] = useState('datos-basicos');
    const [sugerencias, setSugerencias] = useState([])
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false)
    const [mostrarClave, setMostrarClave] = useState(false);

    useEffect(() => {
        obtenerEnumerativas();
    }, []);
    
    const obtenerEnumerativas = async () => {
        try {
            const respuesta = await getEnumerativas();
            setEnumerativas(respuesta);
        } catch (error) {
            console.error("Error al obtener las enumerativas:", error);
        }
    };
    
    const buscarCoincidencias = async (dni) => {
    
        try {
            const respuesta = await getPersonaPorDocumento(dni);
    
            if (Array.isArray(respuesta)) {
                setSugerencias(respuesta);
                setMostrarSugerencias(respuesta.length > 0);
            } else if (respuesta) {
                setSugerencias([respuesta]);
                setMostrarSugerencias(true)
            } else {
                setSugerencias([])
            }
            
        } catch (error) {
            console.error("error al buscar coincidencias:", error);    
        } 
    }

    const seleccionarPersona = (persona) => {
    
        const cambios = {
            id_persona: persona.id,
            numeroDocumento: persona.numeroDocumento,
            nombre: persona.nombre,
            apellido: persona.apellido,
            nacionalidad: persona.nacionalidad
        }

        Object.entries(cambios).forEach(([name, value]) => {
            handleChange({ target: { name, value } })
        });

        setMostrarSugerencias(false)
    }

    useEffect(() => {
        if (data.numeroDocumento && data.numeroDocumento.length >= 4) {
            const timer = setTimeout(() => {
                buscarCoincidencias(data.numeroDocumento);
            }, 500);
                
            return () => clearTimeout(timer);
        } else {
            setSugerencias([]);
            setMostrarSugerencias(false)
        }
    
    }, [data.numeroDocumento]);

    const capitalizarTexto = (texto) => {
        if (!texto || typeof texto !== 'string') return "";
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    return (
        <>
            <Row className="mb-3">
                <Form.Group as={Col} controlId="email">
                    <Form.Label>Correo electronico <span className="asterisco">*</span></Form.Label>
                    <Form.Control 
                        type="email" 
                        name="email" 
                        value={data.email || ""} 
                        onChange={handleChange} 
                        required
                        placeholder="p. ej: ejemplo@correo.com"
                    />
                    <Form.Control.Feedback type="invalid">
                        {data.correo_electronico === ""
                            ? "Por favor, complete este campo."
                            : "El formato del correo no es valido (ejemplo@gmail.com)"
                        }
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>

            <Row className="mb-3">
                <Form.Group as={Col} controlId="rol">
                    <Form.Label>Rol <span className="asterisco">*</span></Form.Label>
                    <Form.Select name="rol" value={data.rol} onChange={handleChange} required>
                        <option value="">Seleccione el perfil de usuario</option>
                        <option value="consulta">Consulta</option>
                        <option value="admin">Administrador</option>
                        <option value="superadmin">Super Administrador</option>
                    </Form.Select>

                    <Form.Control.Feedback type="invalid">
                        Por favor, seleccione una opción.
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} controlId="clave">
                    <Form.Label>Contraseña <span className="asterisco">*</span></Form.Label>
                    <InputGroup className="contenedor-password">
                        <Form.Control 
                            type={mostrarClave ? "text" : "password"}
                            name="clave" 
                            className="input-password"
                            value={data.clave} 
                            onChange={handleChange} 
                            required 
                            autoComplete="new-password"
                            placeholder="Mínimo 6 caracteres"
                        />
                        <Button
                            variant="outline-secondary"
                            onClick={() => setMostrarClave(!mostrarClave)}
                            className="boton-ojo"
                        >
                            {mostrarClave ? <EyeSlash size={20} /> : <Eye size={20} />}
                        </Button>
                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>
                    </InputGroup>
                </Form.Group>
            </Row>

            <h5 className="titulo-seccion-opcional">Datos de persona (opcional)</h5>

            <Row className="mb-3">
                <Form.Group as={Col} controlId="tipoDocumento">
                    <Form.Label>Tipo de Documento</Form.Label>
                        <Form.Select 
                            name="tipoDocumento" 
                            value={data.tipoDocumento || ""} 
                            onChange={handleChange} 
                        >
                            <option value="">Seleccione el Tipo de Documento</option>
                            {enumerativas?.tipos_documento?.map((td) => (
                                <option key={td} value={td}>{td === "PASAPORTE" ? capitalizarTexto(td) : td}</option>
                            ))}
                        </Form.Select>
                </Form.Group>
            
                <Form.Group as={Col} controlId="numeroDocumento">
                    <Form.Label>Número de Documento</Form.Label>
                        <div className="contenedor-busqueda">
                            <Form.Control 
                                type="text" 
                                name="numeroDocumento" 
                                autoComplete="off"
                                placeholder="Ingrese Documento"
                                value={data?.numeroDocumento || ""} 
                                onChange={handleChange} 
                            />
                            {mostrarSugerencias && (
                                <ul className="lista-sugerencias">
                                    {sugerencias.map((p) => (
                                        <li key={p.id || p.numeroDocumento} onClick={() => seleccionarPersona(p)}> <strong>{p.numeroDocumento}</strong> - {p.apellido}, {p.nombre}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                                    
                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>            
                </Form.Group>
            </Row>

            <Row className="mb-3">
                <Form.Group as={Col} controlId="nombre">
                    <Form.Label>Nombre</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="nombre" 
                            placeholder="Nombre del Personal"
                            value={data?.nombre || ""} 
                            onChange={handleChange} 
                        />
            
                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>
                                
                </Form.Group>
            
                <Form.Group as={Col} controlId="apellido">
                    <Form.Label>Apellido</Form.Label>
                        <Form.Control 
                            type="text" 
                            name="apellido" 
                            placeholder="Apellido del Personal"
                            value={data?.apellido || ""} 
                            onChange={handleChange} 
                        />
            
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>
            
            <Row className="mb-3">
                <Form.Group as={Col} controlId="nacionalidad">
                    <Form.Label>Nacionalidad</Form.Label>
                    <Form.Control 
                        type="text" 
                        name="nacionalidad"
                        placeholder="Nacionalidad del Personal"
                        value={data?.nacionalidad|| ""} 
                        onChange={handleChange} 
                    />
                </Form.Group>

                
            </Row>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <Button variant="primary" type="submit" style={{'backgroundColor': '#6b6b6b', 'borderColor': '#6b6b6b'}}> 
                    {modificando ? "Guardar Cambios" : "Agregar Usuario"}
                </Button> 
            </div>
        </>
    );
};

export default FormularioUsuario;