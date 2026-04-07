//react
import React, { useEffect, useState, useMemo } from "react";
import { createInstitucion, getInstitucion, getInstituciones, updateInstitucion, deleteInstitucion } from "../../services/InstitucionService";
import './Institucion.css'
//react
import { FloatingLabel, Form, Button, Col, Row, Pagination } from 'react-bootstrap';
import { sileo } from "sileo";

//componentes
import Tabla from "../../components/Tabla";
import FormularioInstitucion from "./FormularioInstitucion";
import ModalFormularios from "../../components/ModalFormularios";
import BotonAgregar from "../../components/BotonAgregar";

//estilos
import './Institucion.css'

//iconos
import imagenModificar from "../../images/modificar.png"
import imagenMas from "../../images/mas.png";
import imagenEliminar from "../../images/eliminar.png"

import { usoDePermisos } from "../../hooks/usoDePermisos";
import { PermisoAccion } from "../../components/seguridad/PermisoAccion";

//service
function Institucion() {

    const [mostrarModal, setMostrarModal] = useState(false)

    const [instituciones, setInstituciones] = useState([])

    const [paginaActual, setPaginaActual] = useState(1)
    const [totalPaginas, setTotalPaginas] = useState(1);

    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [configConfirmar, setConfigConfirmar] = useState({ titulo: '', mensaje: '', accion: null });

    const [institucionSeleccionadaId, setInstitucionSeleccionadaId] = useState(null)

    const { puedeEditar, puedeEliminar } = usoDePermisos();
    const [busqueda, setBusqueda] = useState("");  
    const [ordenAlfabetico, setOrdenAlfabetico] = useState("ninguno"); 

    const [infoModal, setInfoModal] = useState({
        titulo: '',
        tipo: null
    })

    const [datosNuevaInstitucion, setDatosNuevaInstitucion] = useState({
        nombre: '',
        pais: '',
        descripcion: '',
    });

    const [datosFormularioInstitucion, setDatosFormularioInstitucion] = useState({
        nombre: '',
        pais: '',
        descripcion: ''
    });

    const [idInstitucionModificar, setIdInstitucionModificar] = useState(null)

    const [claveFormulario, setClaveFormulario] = useState(0);

    const columnas = useMemo(() => {
        const base = [
            'Selección',
            'Nombre',
            'Ubicación',
            'Descripcion'
        ];

        if (puedeEditar || puedeEliminar) {
            base.push('Acciones');
        }

        return base;
    }, [puedeEditar, puedeEliminar]);

    const [validacion, setValidacion] = useState(false)

    const handleCambioRadioButton = (id) => {
        setInstitucionSeleccionadaId(id);
    };


    useEffect(() => {
        obtenerInstituciones();
    }, [paginaActual, busqueda, ordenAlfabetico]);

    const obtenerInstituciones = async () => {
        try {

            let direccion = "desc"
            let columna = "id"

            if(ordenAlfabetico === "az") {
                direccion = "asc"
                columna = "nombre"
            } else if(ordenAlfabetico === "za") {
                direccion = "desc"
                columna = "nombre"
            }

            const filtrosInstitucion = {
                busqueda: busqueda
            }

            const data = await getInstituciones(paginaActual, 5, filtrosInstitucion, columna, direccion);
            setInstituciones(data.datos || []);
            setTotalPaginas(data.metadatos?.total_paginas || 1);
        } catch (error) {
            console.error("Error al obtener las instituciones:", error);
        }
    }

    const handleFormularioNuevo = (event) => {
        const { name, value } = event.target;
        setDatosNuevaInstitucion(prev => ({...prev, [name]: value}))
    };

    const handleCambioFormulario = (event) => {
        const { name, value } = event.target;
        setDatosFormularioInstitucion(prev => ({...prev, [name]: value}));
    };

    const handleEnvio = async (event) => {

        const formulario = event.currentTarget;

        if(formulario.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidacion(true)
            return;
        }

        event.preventDefault()

        try {
            const datosACrear = {
                ... datosNuevaInstitucion
            }

            await createInstitucion(datosACrear)

            setDatosNuevaInstitucion({
                nombre: '',
                pais: '',
                descripcion: ''
            });

            await obtenerInstituciones()
            setMostrarModal(false)
            setValidacion(false)

        } catch (error) {
            console.error("Error al crear la institucion");

            alert(`Error al crear la institucion: ${error.message}`)
        }
    };

    

    const handleActualizacion = async (e) => {
        e.preventDefault();

        sileo.promise((async () => {
            await updateInstitucion(idInstitucionModificar, datosFormularioInstitucion);

            await obtenerInstituciones();
            setMostrarModal(false);
            setIdInstitucionModificar(null);
            setDatosFormularioInstitucion({
                nombre: '',
                pais: '',
                descripcion: ''
            });
        })(), {
            loading: { title: "Actualizando datos..." },
            success: { title: "¡Institución modificada!", description: "Los cambios se guardaron correctamente." },
            error: { title: "Error", description: "Ocurrió un problema al modificar la institución." }
        });
    };

    const handleEliminacion = async (id, nombre) => {
        if (id !== institucionSeleccionadaId) {
            return sileo.warning({ 
                title: "Selección requerida", 
                description: "Debe seleccionar una institución antes de eliminar." 
            });
        }

        setConfigConfirmar({
            titulo: 'Eliminar Institución',
            mensaje: `¿Está seguro que quiere eliminar la institución "${nombre}"? Esta acción es irreversible.`,
            accion: () => ejecutarEliminacion(id, nombre) 
        });
        
        setMostrarConfirmar(true);
    };

    const ejecutarEliminacion = async (id, nombre) => {
        setMostrarConfirmar(false);

        sileo.promise((async () => {
            await deleteInstitucion(id);
            await obtenerInstituciones();
            setInstitucionSeleccionadaId(null);
        })(), {
            loading: { title: "Eliminando institución..." },
            success: { title: "Éxito", description: `La institución ${nombre} ha sido eliminada.` },
            error: { title: "Error", description: "No se pudo eliminar la institución." }
        });
    };

    const iniciarModificacion = async (id) => {

        if (id != institucionSeleccionadaId) {
            return sileo.warning({ 
                title: "Selección requerida", 
                description: "Debe seleccionar la institucion antes de modificar." 
            });
        }

        try {
            const institucionAModificar = await getInstitucion(id);

            setIdInstitucionModificar(id);

            setDatosFormularioInstitucion({
                nombre: institucionAModificar.nombre || '',
                pais: institucionAModificar.pais || '',
                descripcion: institucionAModificar.descripcion || ''
            });

            setInfoModal({
                titulo: `Modificar Institucion: ${institucionAModificar.nombre}`,
                tipo: 'modificar'
            })

            setMostrarModal(true)

        } catch (error) {
            console.error("Error al cargar los datos para modificar:", error)

            alert(`No se pudo cargar el grupo para edicion: ${error.message}`);
        }
    };

    function agregarInstitucion() {

        setDatosNuevaInstitucion({
            nombre: '',
            pais: '',
            descripcion: ''
        });

        setValidacion(false);

        setIdInstitucionModificar(null);

        setClaveFormulario(prevKey => prevKey + 1);

        setInfoModal({
            titulo: "Agregar Institucion",
            tipo: 'agregar'
        });

        setMostrarModal(true);
    }

    const paginar = (numeroPagina) => {
        setPaginaActual(numeroPagina);
        setInstitucionSeleccionadaId(null); 
    };

    const filasTabla = instituciones.map(institucion => {

        const institucionId = institucion.id;
        const institucionNombre = institucion.nombre;

        const radioButton = (
            <input 
                type="radio"
                className="form-check-input"
                name="seleccionInstitucion"
                checked={institucionSeleccionadaId === institucionId}
                onChange={() => handleCambioRadioButton(institucionId)}
            />
        );

        let celdaAcciones = null;
        if(puedeEditar || puedeEliminar) {

            const botonModificar = (
                <PermisoAccion permisoRequerido="editar">
                    <BotonAgregar
                        accion = {() => iniciarModificacion(institucionId)}
                    >
                        <img src={imagenModificar} alt="icono modificar" style={{width: '15px'}} />
                    </BotonAgregar>
                </PermisoAccion>
            )

            const botonEliminar = (
                <PermisoAccion permisoRequerido="eliminar">
                    <BotonAgregar
                        accion = {() => handleEliminacion(institucionId, institucionNombre)}
                    >
                        <img src={imagenEliminar} alt="icono eliminar" style={{width: '15px'}} />
                    </BotonAgregar>
                </PermisoAccion>
            )

            celdaAcciones = (
                <div
                    style={{display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px'}}
                >
                    {botonModificar}
                    {botonEliminar}
                </div>
            );
        }

        const fila = [
            radioButton, 
            institucion.nombre,
            institucion.pais,
            institucion.descripcion
        ];

        if (celdaAcciones) {
            fila.push(celdaAcciones);
        }

        return fila;
    });

    const renderizarContenidoModal = () => {

        const tipo = infoModal.tipo;
        
        switch(tipo) {
            case 'agregar':
                return (
                    <Form
                        onSubmit={handleEnvio}
                        key={claveFormulario}
                        noValidate
                        validated={validacion}
                    >
                        <FormularioInstitucion
                            data={datosNuevaInstitucion}
                            handleChange={handleFormularioNuevo}
                            modificandoFormulario={false}
                        />
                    </Form>
                );
            case 'modificar':
                return(
                    <Form
                        onSubmit={handleActualizacion}
                    >
                        <FormularioInstitucion
                            data={datosFormularioInstitucion}
                            handleChange={handleCambioFormulario}
                            modificandoFormulario={true}
                        />

                    </Form>
                );
        }
    };

    return (
        <div className="institucion-layout">
            <div className="institucion-contenido">
                <div className="row institucion mt-3">
                    <div className="institucion mt-e text-center">
                        <h1 className="mb1 titulo-institucion">Instituciones</h1>
                    </div>
                    
                    <div className="filtros-container">
                        <div className="row align-items-center justify-content-center g-3">
                            <div className="col-lg-4 col-md-12">
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    value={busqueda}
                                    onChange={(e) => {
                                        setBusqueda(e.target.value);
                                        setPaginaActual(1)
                                    }}
                                />
                            </div>

                            <div className="col-lg-3 col-md-4">
                                <Form.Select
                                    value={ordenAlfabetico}
                                    onChange={(e) => setOrdenAlfabetico(e.target.value)}
                                >
                                    <option value="ninguno">Sin orden específico</option>
                                    <option value="az">Ordenar de A a Z</option>
                                    <option value="za">Ordenar de Z a A</option>
                                </Form.Select>
                            </div>

                            <div className="col-lg-3 col-md-3 d-flex justify-content-center">
                                <PermisoAccion permisoRequerido="editar">
                                    <BotonAgregar
                                        className="boton-agregar"
                                        accion={agregarInstitucion}
                                    >
                                        <img  src={imagenMas} alt="imagen agregar" style={{width: '13px', display: 'block'}}/>
                                        Agregar Institucion
                                    </BotonAgregar>
                                </PermisoAccion>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="tabla-wrapper">
                    <div className="tabla-container">
                        <Tabla
                            columnas={columnas}
                            filas={filasTabla}
                        />
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev
                                    onClick={() => paginar(paginaActual - 1)}
                                    disabled={paginaActual === 1}
                                />
                                {[...Array(totalPaginas)].map((_, i) => (
                                    <Pagination.Item
                                        key={i+1} 
                                        active={i+1 === paginaActual} 
                                        onClick={() => paginar(i+1)}
                                    >
                                        {i+1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => paginar(paginaActual + 1)} disabled={paginaActual === totalPaginas} 
                                />
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>
            <ModalFormularios
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
                titulo={infoModal.titulo}
            >
                {renderizarContenidoModal()}

            </ModalFormularios>

            <ModalFormularios 
                show={mostrarConfirmar} 
                onHide={() => setMostrarConfirmar(false)} 
                titulo={configConfirmar.titulo}
            >
                <div className="p-3 text-center">
                    <p>{configConfirmar.mensaje}</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button variant="danger" onClick={() => setMostrarConfirmar(false)}>
                            Cancelar
                        </Button>
                        <Button onClick={configConfirmar.accion} style={{backgroundColor: '#6b6b6b', borderColor: '#6b6b6b'}}>
                            Confirmar
                        </Button>
                    </div>
                </div>
            </ModalFormularios>
        </div>
    )
}

export default Institucion;