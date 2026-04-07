import React from "react";
import { Form, Button, Col, Row } from "react-bootstrap";
import "../../components/Formulario.css";

const LIMITES = {
    TEXTO_CORTO: 250,
    TEXTO_LARGO: 1000
};

const FormularioInstitucion = ({data, handleChange, modificandoFormulario}) => {

    return (
        <>
        
            <Row className="mb-3">
                <Form.Group as={Col} xs={12} md={6} className="mb-3 mb-md-0" controlId="nombre">

                    <Form.Label>Nombre <span className="asterisco">*</span>
                    </Form.Label>

                    <Form.Control
                        type="text"
                        placeholder="Nombre de la institución"
                        value={data?.nombre || ""}
                        name="nombre"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.nombre?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.nombre?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                    <Form.Control.Feedback 
                        type="invalid"
                    >
                        Por favor, complete este campo
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group as={Col} xs={12} md={6} controlId="pais">

                    <Form.Label>Región <span  className="asterisco">*</span>
                    </Form.Label>

                    <Form.Control
                        type="text"
                        placeholder="Localidad o país de la institución"
                        value={data?.pais || ""}
                        name="pais"
                        onChange={handleChange}
                        required
                        maxLength={LIMITES.TEXTO_CORTO}
                    />
                    <div className="text-end">
                        <small className={data.pais?.length >= LIMITES.TEXTO_CORTO ? "text-danger fw-bold" : "text-muted"}>
                            {data.pais?.length || 0} / {LIMITES.TEXTO_CORTO} 
                        </small>
                    </div>
                    <Form.Control.Feedback 
                        type="invalid"
                    >
                        Por favor, complete este campo
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>

            <Row>

                <Form.Group className="mb-3" controlId="descripcion">
                    <Form.Label>Descripcion <span className="asterisco">*</span></Form.Label>

                    <Form.Control
                        as='textarea'
                        placeholder="Mínimo 10 caracteres"
                        value={data?.descripcion || ""}
                        name="descripcion"
                        onChange={handleChange}
                        minLength={10}
                        required
                        maxLength={LIMITES.TEXTO_LARGO}
                    />
                    <div className="text-end">
                        <small className={data.descripcion?.length >= LIMITES.TEXTO_LARGO ? "text-danger fw-bold" : "text-muted"}>
                            {data.descripcion?.length || 0} / {LIMITES.TEXTO_LARGO} 
                        </small>
                    </div>
                    <Form.Control.Feedback type="invalid">
                        {data?.descripcion?.length > 0 && data?.descripcion?.length < 10 
                            ? `Faltan ${10 - data.descripcion.length} caracteres más` 
                            : "Por favor, complete este campo (mínimo 10 caracteres)"}
                    </Form.Control.Feedback>
                </Form.Group>
            </Row>

            <div style={{ textAlign: 'right', marginTop: '15px' }}>
                <Button variant="primary" type="submit" style={{'background-color': '#6b6b6b', 'border-color': '#6b6b6b'}}> 
                    {modificandoFormulario ? "Guardar Cambios" : "Agregar Institucion"}
                </Button>
            </div>
        </>
    )
};

export default FormularioInstitucion;