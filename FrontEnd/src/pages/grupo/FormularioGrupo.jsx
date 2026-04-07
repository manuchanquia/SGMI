import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Col, Row, Dropdown, Modal } from 'react-bootstrap';
import "../../components/Formulario.css";
import "./Grupo.css"

import { getInstituciones, createInstitucion } from '../../services/InstitucionService';

import FormularioInstitucion from '../institucion/FormularioInstitucion';

const LIMITES = {
    SIGLA: 10,
    NOMBRE: 100,
    TEXTO_LARGO: 1000,
    TEXTO_CORTO: 250
};



const FormularioGrupo = ({ data, handleChange, isModifying, onAbrirNuevoModalInstitucion, validacion, instituciones }) => {
    

    const [filtro, setFiltro] = useState("")
    const [mostrarDropdown, setMostrarDropdown] = useState(false)

    const [mostrarModal, setMostrarModal] = useState(false)
    const [nuevaInstitucion, setNuevaInstitucion] = useState({nombre: ""})

    const handleGuardarNuevaInstitucion = async () => {
        
        try {
            const respuesta = await createInstitucion(nuevaInstitucion)
            const creada = respuesta.data || respuesta;
        
            await cargarInstituciones();

            handleChange({ target: {name: 'institucionId', value: creada.id}});

            setMostrarModal(false);
            setNuevaInstitucion({nombre: ""})
        
        } catch (error) {
            alert("Error al crear la institucion")
        }
    }

    const alFinalizarCreacion = async (nuevaInstitucion) => {
        await cargarInstituciones();
        setMostrarModal(false);

        if (nuevaInstitucion && nuevaInstitucion.id) {
            handleChange({target: {name: 'institucionId', value: nuevaInstitucion.id}})
        }
    }

    return (

        <>
            <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="sigla"> 
                    <Form.Label> Sigla <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Sigla del grupo" 
                        value={data.sigla}
                        name="sigla" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.SIGLA}
                    />
                    <div className="text-end">
                        <small className={data.sigla?.length >= LIMITES.SIGLA ? "text-danger fw-bold" : "text-muted"}>
                            {data.sigla?.length || 0} / {LIMITES.SIGLA} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="nombre">
                    <Form.Label> Nombre <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Nombre del Grupo" 
                        value={data.nombre}
                        name="nombre" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.NOMBRE}
                    />
                    <div className="text-end">
                        <small className={data.nombre?.length >= LIMITES.NOMBRE ? "text-danger fw-bold" : "text-muted"}>
                            {data.nombre?.length || 0} / {LIMITES.NOMBRE} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row className="mb-3">

                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="institucionId">
                    <Form.Label> Unidad Académica <span className='asterisco'>*</span> </Form.Label>

                    <Dropdown
                        show={mostrarDropdown}
                        onToggle={(isOpen) => setMostrarDropdown(isOpen)}
                        className="w-100"
                    >
                        <Dropdown.Toggle
                            className={`w-100 text-start d-flex justify-content-between align-items-center dropdown-bootstrap-custom ${
                                validacion && !data.institucionId ? 'is-invalid-custom is-invalid' : ''
                            }`}
                        >

                            <span className={!data.institucion ? 'text-placeholder' : ''}>
                                {instituciones.find(institucion => institucion.id === data.institucionId)?.nombre || "Seleccione una opción"}
                            </span>
                            
                        </Dropdown.Toggle>

                        <Dropdown.Menu className="w-100">
                            <div className="px-3 py-2">
                                <Form.Control
                                    autoFocus
                                    placeholder='Buscar por nombre'
                                    onChange={(event) => setFiltro(event.target.value)}
                                    value={filtro}
                                />
                            </div>

                            <Dropdown.Divider />

                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {(() => {
                                    const filtradas = instituciones.filter(inst =>
                                        inst.nombre.toLowerCase().includes(filtro.toLowerCase())
                                    );

                                    if (filtradas.length === 0) {
                                        return (
                                            <div className="text-muted text-center py-3">
                                                No se encontraron instituciones con ese nombre.
                                            </div>
                                        );
                                    }

                                    return filtradas.map((inst) => (
                                        <Dropdown.Item
                                            key={inst.id}
                                            onClick={() => {
                                                handleChange({ target: { name: 'institucionId', value: inst.id } });
                                                setMostrarDropdown(false);
                                            }}
                                        >
                                            {inst.nombre}
                                        </Dropdown.Item>
                                    ));
                                })()}
                            </div>
                        </Dropdown.Menu>
                    </Dropdown>

                    <Form.Control
                        type='hidden'
                        required
                        isInvalid={validacion && !data.institucionId}
                    />

                    <Form.Control.Feedback type="invalid">
                        Por favor, seleccione una opción.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="correo_electronico">
                    <Form.Label> Correo Electrónico <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="email" 
                        placeholder="p. ej.: correogrupo@gmail.com" 
                        value={data.correo_electronico}
                        name="correo_electronico" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.correo_electronico?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.correo_electronico?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        {data.correo_electronico === ""
                            ? "Por favor, complete este campo."
                            : "El formato del correo no es valido (ejemplo@gmail.com)"
                        }
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>


            <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="director">
                    <Form.Label> Director/a <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control
                        type='text' 
                        placeholder="Nombre y Apellido"
                        value={data.director}
                        name="director" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.NOMBRE}
                    />
                    <div className="text-end">
                        <small className={data.director?.length >= LIMITES.NOMBRE ? "text-danger fw-bold" : "text-muted"}>
                            {data.director?.length || 0} / {LIMITES.NOMBRE} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="vicedirector">
                    <Form.Label> Vicedirector/a <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control
                        type='text' 
                        placeholder="Nombre y Apellido"
                        value={data.vicedirector}
                        name="vicedirector" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.NOMBRE}
                    />
                    <div className="text-end">
                        <small className={data.vicedirector?.length >= LIMITES.NOMBRE ? "text-danger fw-bold" : "text-muted"}>
                            {data.vicedirector?.length || 0} / {LIMITES.NOMBRE} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row>
                <Form.Group className="mb-3" controlId="objetivos">
                    <Form.Label> Objetivos <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control
                        as='textarea' 
                        placeholder="Objetivos del Grupo"
                        value={data.objetivos}
                        name="objetivos"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_LARGO}
                    />
                    <div className="text-end">
                        <small className={data.objetivos?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.objetivos?.length || 0} / {LIMITES.TEXTO_LARGO} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row>
                <Form.Group className="mb-3" controlId="organigrama">
                    <Form.Label> Organigrama <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control
                        as='textarea' 
                        placeholder="Organigrama del Grupo"
                        value={data.organigrama}
                        name="organigrama"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_LARGO}
                    />
                    <div className="text-end">
                        <small className={data.organigrama?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.organigrama?.length || 0} / {LIMITES.TEXTO_LARGO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row>
                <Form.Group className="mb-3" controlId="consejo_ejecutivo">
                <Form.Label> Consejo Ejecutivo </Form.Label>
                <Form.Control
                    as='textarea' 
                    placeholder="Consejo Ejecutivo del Grupo"
                    value={data.consejo_ejecutivo}
                    name="consejo_ejecutivo" 
                    onChange={handleChange}
                    maxLength={LIMITES.TEXTO_LARGO}
                />
                <div className="text-end">
                    <small className={data.consejo_ejecutivo?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                        {data.consejo_ejecutivo?.length || 0} / {LIMITES.TEXTO_LARGO} 
                    </small>
                </div>
                </Form.Group>
            </Row>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <Button variant="primary" type="submit" style={{'backgroundColor': '#6b6b6b', 'borderColor': '#6b6b6b'}}> 
                    {isModifying ? "Guardar Cambios" : "Agregar Grupo"}
                </Button>
            </div>
        </>
    
    )    
};

export default FormularioGrupo;