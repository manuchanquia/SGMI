import React, { useState, useEffect, useMemo } from 'react';
import { Form, Button, Col, Row, Dropdown, Modal } from 'react-bootstrap';
import "../../components/Formulario.css";


const LIMITES = {
    CODIGO: 50,
    NOMBRE: 100,
    TEXTO_LARGO: 1000,
    TEXTO_CORTO: 250
};

const FormularioProyecto = ({ data, handleChange, isModifying, validacion }) => {

    return (

        <>
        {/* --- FILA 1: Código y Tipo --- */}
            <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="codigo"> 
                    <Form.Label> Codigo <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="p.ej.: MPAF1" 
                        value={data.codigo}
                        name="codigo" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.CODIGO}
                    />
                    <div className="text-end">
                        <small className={data.codigo?.length >= LIMITES.CODIGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.codigo?.length || 0} / {LIMITES.CODIGO} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="tipo">
                    <Form.Label> Tipo de Proyecto <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="p. ej.: proyecto de diseño" 
                        value={data.tipo}
                        name="tipo" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.tipo?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.tipo?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>
            
            <Row className="mb-3">

                <Form.Group as={Col} controlId="nombre">
                    <Form.Label> Nombre <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Nombre del Proyecto" 
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

                <Form.Group as={Col} controlId="financiamiento">
                    <Form.Label> Financiamiento <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Financiamiento del Proyecto" 
                        value={data.financiamiento}
                        name="financiamiento" 
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

            <Row className="mb-3">

                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="fechaInicio">
                    <Form.Label> Fecha de Inicio <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="date" 
                        placeholder="Fecha de inicio del proyecto" 
                        value={data.fechaInicio}
                        name="fechaInicio" 
                        onChange={handleChange}
                        required
                    />

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="fechaFin">
                    <Form.Label> Fecha de Fin </Form.Label>
                    <Form.Control 
                        type="date" 
                        placeholder="Fecha de finalización del proyecto" 
                        value={data.fechaFin}
                        name="fechaFin" 
                        onChange={handleChange}
                        min={data.fechaInicio} 
                        isInvalid={data.fechaFin && data.fechaInicio && data.fechaFin < data.fechaInicio}
                    />

                    <Form.Control.Feedback type="invalid">
                        La fecha de fin no puede ser anterior a la de inicio.
                    </Form.Control.Feedback>

                </Form.Group>

            </Row>

            <Row>
                <Form.Group className="mb-3" controlId="descripcion">
                    <Form.Label> Descripción <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control
                        as='textarea' 
                        placeholder="Descripción del Proyecto"
                        value={data.descripcion}
                        name="descripcion"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_LARGO}
                    />
                    <div className="text-end">
                        <small className={data.descripcion?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.descripcion?.length || 0} / {LIMITES.TEXTO_LARGO} 
                        </small>
                    </div>


                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row>
                <Form.Group className="mb-3" controlId="logros">
                    <Form.Label> Logros </Form.Label>
                    <Form.Control
                        as='textarea' 
                        placeholder="Logros Alcanzados por el Proyecto"
                        value={data.logros}
                        name="logros"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_LARGO}
                    />
                        
                    <div className="text-end">
                        <small className={data.logros?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.logros?.length || 0} / {LIMITES.TEXTO_LARGO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row>
                <Form.Group className="mb-3" controlId="dificultades">
                <Form.Label> Dificultades </Form.Label>
                <Form.Control
                    as='textarea' 
                    placeholder="Dificultades que se presentaron durante la realizacion del proyecto"
                    value={data.dificultades}
                    name="dificultades" 
                    onChange={handleChange}
                    maxLength={LIMITES.TEXTO_LARGO}
                />
               
                <div className="text-end">
                    <small className={data.dificultades?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                        {data.dificultades?.length || 0} / {LIMITES.TEXTO_LARGO} 
                    </small>
                </div>
                 </Form.Group>    
            </Row>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <Button variant="primary" type="submit" style={{'backgroundColor': '#6b6b6b', 'borderColor': '#6b6b6b'}}> 
                    {isModifying ? "Guardar Cambios" : "Agregar Proyecto"}
                </Button>
            </div>
        </>
    
    )    
};

export default FormularioProyecto;