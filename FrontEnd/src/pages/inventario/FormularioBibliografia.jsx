import React from 'react';
import { Form, Button, Col, Row } from 'react-bootstrap';
import "../../components/Formulario.css";

const LIMITES = {
    TEXTO_CORTO: 250,
    TEXTO_LARGO: 1000
};

const FormularioBibliografia = ({ data, handleChange, isModifying, handler, validacion, setValidacion}) => {

    return (

        <Form noValidate validated={validacion} onSubmit={handler}>
            <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="titulo"> 
                    <Form.Label> Título <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Título del libro" 
                        value={data.titulo}
                        name="titulo" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.titulo?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.titulo?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="editorial">
                    <Form.Label> Editorial <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Editorial del libro" 
                        value={data.editorial}
                        name="editorial" 
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.editorial?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.editorial?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row className="mb-3">

                <Form.Group controlId="autores">
                    <Form.Label>Autor/es <span className='asterisco'>*</span> </Form.Label>
                    
                    <Form.Control
                        as='textarea'
                        placeholder="Autor/es del libro"
                        value={data?.autores}
                        name="autores"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_LARGO}
                    />
                    <div className="text-end">
                        <small className={data.autores?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.autores?.length || 0} / {LIMITES.TEXTO_LARGO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>
            </Row>

            <Row className="mb-3">

                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="fecha">
                    <Form.Label> Fecha de Registro <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="date" 
                        placeholder="Fecha en la que se registra el libro" 
                        value={data.fecha}
                        name="fecha" 
                        onChange={handleChange}
                        required
                    />

                    <Form.Control.Feedback type="invalid">
                        Por favor, complete este campo.
                    </Form.Control.Feedback>

                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="anio">
                    <Form.Label> Año <span className='asterisco'>*</span> </Form.Label>
                    <Form.Control 
                        type="number" 
                        placeholder="Año de edición del libro" 
                        value={data.anio}
                        name="anio" 
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
                    {isModifying ? "Guardar Cambios" : "Agregar Bibliografía"}
                </Button>
            </div>
        </Form>
    )    
};

export default FormularioBibliografia;