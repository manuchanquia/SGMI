import React from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import "../../components/Formulario.css";

const LIMITES = {
    TEXTO_CORTO: 250,
    TEXTO_LARGO: 1000
}

const FormularioEquipamiento = ({ data, handleChange, isModifying, handler, validacion }) => {

    return (

        <Form noValidate validated={validacion} onSubmit={handler}>
            <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="denominacion"> 
                    <Form.Label> Denominación <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="p.ej.: Microscopio" 
                        value={data.denominacion}
                        name="denominacion" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.denominacion?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.denominacion?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="fechaIngreso">

                    <Form.Label> Fecha de Ingreso <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="date" 
                        placeholder="Fecha de ingreso del equipamiento" 
                        value={data.fechaIngreso}
                        name="fechaIngreso" 
                        onChange={handleChange}
                        required
                    />

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

            </Row>

            <Row className="mb-3">

                <Form.Group controlId="descripcion">

                    <Form.Label> Descripción <span className='asterisco'>*</span> </Form.Label>
                                    
                        <Form.Control
                            as='textarea'
                            placeholder="Descripción del equipamiento"
                            value={data?.descripcion}
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

            <Row className="mb-3">

                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="actividad"> 
                    <Form.Label> Actividad <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Actividad a la que está destinada el equipamiento" 
                        value={data.actividad}
                        name="actividad" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.actividad?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.actividad?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="monto"> 
                    <Form.Label> Monto <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="number" 
                        placeholder="Monto que costó el equipamiento" 
                        value={data.monto}
                        name="monto" 
                        onChange={handleChange}
                        required
                    />

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <Button variant="primary" type="submit" style={{'backgroundColor': '#6b6b6b', 'borderColor': '#6b6b6b'}}> 
                    {isModifying ? "Guardar Cambios" : "Agregar Equipamiento"}
                </Button>
            </div>
        </Form>
    )    
};

export default FormularioEquipamiento;