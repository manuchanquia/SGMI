import React, { useState, useEffect } from "react";
import { Form, Button, Col, Row, Tab, Tabs } from "react-bootstrap";
import { getEnumerativas } from "../../services/EnumerativasService";
import { getPersonaPorDocumento } from "../../services/PersonaService";
import "../../components/Formulario.css";
import "./Personal.css"

const LIMITES = {
    TEXTO_LARGO: 1000,
    TEXTO_CORTO: 250
};


const FormularioPersonal = ({ data, handleChange, isModifying, validacion, setValidacion }) => {

    const [enumerativas, setEnumerativas] = useState(null);
    
    const [key, setKey] = useState('datos-basicos');

    const [sugerencias, setSugerencias] = useState([])

    const [mostrarSugerencias, setMostrarSugerencias] = useState(false)

    const [intentoSiguiente, setIntentoSiguiente] = useState(false);


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
        if(persona.activo) {
            alert("Esta persona se encuentra activa en otro grupo");
            setMostrarSugerencias(false);
            return;
        }

        const cambios = {
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

    const handleSiguiente = () => {
        if (!data.tipoPersonal) {
            setIntentoSiguiente(true);
            return;
        }

        setIntentoSiguiente(false);
        setKey('detalles');
    };


    const handleVolver = () => {
        setKey('datos-basicos');
    }

    const capitalizarTexto = (texto) => {
        if (!texto || typeof texto !== 'string') return "";
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    const hoy = new Date().toISOString().split('T')[0];

    return (
        <Tabs
            id="formulario-personal-tabs"
            activeKey={key}
            className="mb-3"
            justify
        >
            <Tab eventKey="datos-basicos" title="1. Tipo de Personal">
                <Row className="p-3">
                    <Form.Group as={Col} controlId="tipoPersonalGroup">
                        <Form.Label className="fw-bold mb-3">Seleccione Tipo de Profesional <span className='asterisco'>*</span></Form.Label>
                        <div className="d-flex flex-column gap-3 formulario-personal-radios">
                            {enumerativas?.tipos_personal &&
                                enumerativas.tipos_personal.map((tipo) => (
                                    <Form.Check
                                        key={tipo}
                                        type="radio"
                                        label={capitalizarTexto(tipo)}
                                        name="tipoPersonal"
                                        value={tipo}
                                        id={`radio-${tipo}`}
                                        checked={data.tipoPersonal === tipo}
                                        onChange={(e) => {
                                            handleChange(e)
                                            if(setValidacion) setValidacion(false)
                                        }}
                                        isInvalid={intentoSiguiente && !data.tipoPersonal}
                                        required
                                    />
                                ))
                            }

                            {intentoSiguiente && !data.tipoPersonal && (
                                <div className="text-danger small">
                                    Debe seleccionar un tipo de personal para continuar.
                                </div>
                            )}

                        </div>

                    </Form.Group>
                </Row>

                <div className="text-end mt-3">
                    <Button 
                        variant="primary" 
                        onClick={handleSiguiente}
                        style={{'background-color': '#6b6b6b', 'border-color': '#6b6b6b'}}
                    >
                        Siguiente
                    </Button>
                </div>
            </Tab>

            
            <Tab eventKey="detalles" title="2. Detalles y Fechas" disabled={!data.tipoPersonal}>
                <Row className="mb-3">
                    <Form.Group as={Col} controlId="tipoDocumento">
                        <Form.Label>Tipo de Documento <span className="asterisco">*</span></Form.Label>
                        <Form.Select 
                            name="tipoDocumento" 
                            value={data.tipoDocumento || ""} 
                            onChange={handleChange} 
                            required
                        >
                            <option value="">Seleccione el Tipo de Documento</option>
                            {enumerativas?.tipos_documento?.map((td) => (
                                <option key={td} value={td}>{td === "PASAPORTE" ? capitalizarTexto(td) : td}</option>
                            ))}
                        </Form.Select>

                        <Form.Control.Feedback type="invalid">
                            Por favor, seleccione una opción.
                        </Form.Control.Feedback>

                    </Form.Group>

                    <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="numeroDocumento">
                        <Form.Label>Número de Documento <span className="asterisco">*</span></Form.Label>

                        <div className="contenedor-busqueda">

                            <Form.Control 
                                type="text" 
                                name="numeroDocumento" 
                                autoComplete="off"
                                placeholder="Ingrese Documento"
                                value={data?.numeroDocumento || ""} 
                                onChange={handleChange} 
                                required 
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
                    <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="nombre">
                        <Form.Label>Nombre <span className="asterisco">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            name="nombre" 
                            placeholder="Nombre del Personal"
                            value={data?.nombre || ""} 
                            onChange={handleChange} 
                            required 
                            maxLength={LIMITES.TEXTO_CORTO}
                        />
                    <div className="text-end">
                        <small className={data.nombre?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.nombre?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>
                    
                    </Form.Group>

                    <Form.Group as={Col} xs={12} md={6} controlId="apellido">
                        <Form.Label>Apellido <span className="asterisco">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            name="apellido" 
                            placeholder="Apellido del Personal"
                            value={data?.apellido || ""} 
                            onChange={handleChange} 
                            required 
                            maxLength={LIMITES.TEXTO_CORTO}
                        />
                    <div className="text-end">
                        <small className={data.apellido?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.apellido?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>

                    </Form.Group>

                </Row>

                <Row className="mb-3">
            
                    <Form.Group controlId="nacionalidad">
                        <Form.Label>Nacionalidad <span className="asterisco">*</span></Form.Label>
                        <Form.Control 
                            type="text" 
                            name="nacionalidad"
                            placeholder="Nacionalidad del Personal"
                            value={data?.nacionalidad|| ""} 
                            onChange={handleChange} 
                            required 
                            maxLength={LIMITES.TEXTO_CORTO}
                        />
                    <div className="text-end">
                        <small className={data.nacionalidad?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.nacionalidad?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>

                    </Form.Group>

                </Row>

                <Row className="mb-3">

                    <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="horas">
                        <Form.Label>Horas semanales <span className="asterisco">*</span></Form.Label>
                        <Form.Control 
                            type="number" 
                            name="horas" 
                            placeholder="Ingrese las horas dedicadas"
                            value={data?.horas || ""} 
                            onChange={handleChange} 
                            required 
                        />

                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>

                    </Form.Group>

                    <Form.Group as={Col} xs={12} md={6} controlId="fechaInicio">
                        <Form.Label>Fecha de Incorporación <span className="asterisco">*</span></Form.Label>
                        <Form.Control 
                            type="date" 
                            name="fechaInicio"
                            max={hoy} 
                            value={data?.fechaInicio || ""} 
                            onChange={handleChange} 
                            required 
                        />

                        <Form.Control.Feedback type="invalid">
                            Por favor, complete este campo.
                        </Form.Control.Feedback>

                    </Form.Group>

                </Row>

                {/*tipo de personal: BECARIO*/}
                {data.tipoPersonal === "BECARIO" && (
                    <Row className="mb-3">    
                        <Form.Group controlId="formacionBecario">
                            <Form.Label>Tipo de Formación <span className="asterisco">*</span></Form.Label>
                            <Form.Select 
                                name="formacionBecario" 
                                value={data?.formacionBecario || ""} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Seleccione Formación</option>
                                {enumerativas?.tipos_formacion?.map((f) => (
                                    <option key={f} value={f}>{capitalizarTexto(f)}</option>
                                ))}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                Por favor, seleccione una opción.
                            </Form.Control.Feedback>

                        </Form.Group>

                        <Form.Group as={Col} controlId="financiamiento">
                            <Form.Label>Fuente de Financiamiento</Form.Label>
                            <Form.Control 
                                type="text" 
                                name="financiamiento"
                                placeholder="p.ej.: SCyT - UTN Rectorado"
                                value={data?.financiamiento || ""} 
                                onChange={handleChange}
                                required
                                maxLength={LIMITES.TEXTO_CORTO}
                            />
                            <div className="text-end">
                                <small className={data.financiamiento?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                                    {data.financiamiento?.length || 0} / {LIMITES.TEXTO_CORTO} 
                                </small>
                            </div>
                            <Form.Control.Feedback type="invalid">
                                Por favor, complete este campo.
                            </Form.Control.Feedback>

                        </Form.Group>
                    </Row>
                )}
                
                {/*tipo de personal: INVESTIGADOR*/}
                {data.tipoPersonal === "INVESTIGADOR" && (
                    <Row className="mb-3">
                        <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="categoria">
                            <Form.Label>Categoría UTN  <span className="asterisco">*</span></Form.Label>
                            <Form.Control 
                                type="text" 
                                name="categoria"
                                placeholder="p.ej.: Resolución 6789/2023" 
                                value={data?.categoria || ""} 
                                onChange={handleChange}
                                maxLength={LIMITES.TEXTO_CORTO}
                            />
                            <div className="text-end">
                                <small className={data.categoria?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                                    {data.categoria?.length || 0} / {LIMITES.TEXTO_CORTO} 
                                </small>
                            </div>
                            <Form.Control.Feedback type="invalid">
                                Por favor, complete este campo.
                            </Form.Control.Feedback>

                        </Form.Group>

                        <Form.Group as={Col} xs={12} md={6} controlId="dedicacion">
                            <Form.Label>Dedicación <span className="asterisco">*</span></Form.Label>
                            <Form.Select 
                                name="dedicacion" 
                                value={data?.dedicacion || ""} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Seleccione Dedicación</option>
                                {enumerativas?.dedicaciones?.map((d) => (
                                    <option key={d} value={d}>{capitalizarTexto(d)}</option>
                                ))}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                Por favor, seleccione una opción.
                            </Form.Control.Feedback>

                        </Form.Group>
                    </Row>
                )}

                {/*tipo de personal: SOPORTE*/}
                {data.tipoPersonal === "SOPORTE" && (
                    <Row className="mb-1">
                        <Form.Group as={Col} controlId="rol">
                            <Form.Label>Rol de Soporte <span className="asterisco">*</span></Form.Label>
                            <Form.Select 
                                name="rol" 
                                value={data.rol || ""} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Seleccione el rol</option>
                                {enumerativas?.roles_soporte?.map((rs) => (
                                    <option key={rs} value={rs}>{capitalizarTexto(rs)}</option>
                                ))}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                Por favor, seleccione una opcion.
                            </Form.Control.Feedback>

                        </Form.Group>
                    </Row>
                )}
                
                {/*tipo de personal: VISITANTE*/}
                {data.tipoPersonal === "VISITANTE" && (
                    <Row className="mb-1">
                        <Form.Group as={Col} controlId="rol">
                            <Form.Label>Rol de Soporte <span className="asterisco">*</span></Form.Label>
                            <Form.Select 
                                name="rol" 
                                value={data.rol || ""} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Seleccione el rol</option>
                                {enumerativas?.roles_visitante?.map((rs) => (
                                    <option key={rs} value={rs}>{capitalizarTexto(rs)}</option>
                                ))}
                            </Form.Select>

                            <Form.Control.Feedback type="invalid">
                                Por favor, seleccione una opción.
                            </Form.Control.Feedback>

                        </Form.Group>
                    </Row> 
                )}
                

                <div className="d-flex justify-content-between mt-4">
                    <Button variant="secondary" onClick={handleVolver}>
                        🡠 Volver
                    </Button>

                    <Button variant="primary" type="submit" style={{'background-color': '#6b6b6b', 'border-color': '#6b6b6b'}}>
                        {isModifying ? "Guardar Cambios" : "Agregar Personal"}
                    </Button>
                </div>

            </Tab>
        </Tabs>
    );
};

export default FormularioPersonal;