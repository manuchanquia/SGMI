//react
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Pagination, Row, Col, FloatingLabel, Button } from 'react-bootstrap';
import { sileo } from "sileo";

// Componentes
import Boton from "../../components/Boton";
import BotonAgregar from "../../components/BotonAgregar";
import Tabla from "../../components/Tabla";
import ModalFormularios from "../../components/ModalFormularios";
import FormularioBibliografia from "./FormularioBibliografia";
import FormularioEquipamiento from "./FormularioEquipamiento";

//para permisos de acciones
import { usoDePermisos } from "../../hooks/usoDePermisos";
import { PermisoAccion } from "../../components/seguridad/PermisoAccion";

// Estilos
import "./Inventario.css";

// Iconos
import imagenMas from "../../images/mas.png";
import imagenModificar from "../../images/modificar.png";
import imagenVolver from "../../images/volver.png";
import imagenEliminar from "../../images/eliminar.png"
import imagenDisponible from "../../images/inventario-alta.png";
import imagenNoDisponible from "../../images/inventario-baja.png";

// Services
import { getBibliografia, getLibro, createBibliografia, updateBibliografia, deleteBibliografia } from "../../services/BibliografiaService";
import { getEquipamiento, getEquipo, createEquipamiento, updateEquipamiento, deleteEquipamiento } from "../../services/EquipamientoService";
import { getPlanificacion, getPlanificaciones } from "../../services/PlanificacionService";
import { getGrupo } from "../../services/GrupoService"; 

function Inventario() {

    // --- 1. ESTADOS DE UI Y NAVEGACIÓN ---
    const [vistaTabla, setVistaTabla] = useState(0); 
    const [mostrarModal, setMostrarModal] = useState(false);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [validacion, setValidacion] = useState(false);
    const [infoModal, setInfoModal] = useState({ titulo: '', tipo: null });

    const { puedeEditar, puedeEliminar } = usoDePermisos();
    
    const [confirmacionModal, setConfirmacionModal] = useState({
        show: false,
        titulo: '',
        mensaje: '',
        onConfirm: () => {}
    });

    const { idPlanificacion } = useParams();
    const navegar = useNavigate();
    const [grupo, setGrupo] = useState(null);

    // ESTADOS PARA BÚSQUEDA Y FILTROS
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");   
    const [ordenAlfabetico, setOrdenAlfabetico] = useState("ninguno"); 

    // ESTADOS PARA IMPORTACIÓN (Clonación)
    const [planificacionActual, setPlanificacionActual] = useState(null);
    const [planificacionesMismoGrupo, setPlanificacionesMismoGrupo] = useState([]);
    const [bibliografiaOrigen, setBibliografiaOrigen] = useState([]);
    const [equipamientoOrigen, setEquipamientoOrigen] = useState([]);
    const [seleccionadosParaClonar, setSeleccionadosParaClonar] = useState([]);
    const [planificacionSeleccionadaId, setPlanificacionSeleccionadaId] = useState(null);
    const [filtroAnio, setFiltroAnio] = useState('');
    
    // --- 2. ESTADOS DE DATOS ---
    const [bibliografia, setBibliografia] = useState([]);
    const [equipamiento, setEquipamiento] = useState([]);
    const [bibliografiaSeleccionadaId, setBibliografiaSeleccionadaId] = useState(null);
    const [equipamientoSeleccionadoId, setEquipamientoSeleccionadoId] = useState(null);

    // --- 3. ESTADOS DE FORMULARIOS ---
    const [idBibliografiaAModificar, setIdBibliografiaAModificar] = useState(null);
    const [idEquipamientoAModificar, setIdEquipamientoAModificar] = useState(null);

    const [datosFormularioBibliografia, setDatosFormularioBibliografia] = useState({
        titulo: '', autores: '', editorial: '', anio: '', fecha: ''
    });

    const [datosNuevaBibliografia, setDatosNuevaBibliografia] = useState({
        titulo: '', autores: '', editorial: '', anio: '', fecha: '', activo: true
    });

    const [datosFormularioEquipamiento, setDatosFormularioEquipamiento] = useState({
        denominacion: '', fechaIngreso: '', descripcion: '', actividad: '', monto: ''
    });

    const [datosNuevoEquipamiento, setDatosNuevoEquipamiento] = useState({
        denominacion: '', fechaIngreso: '', descripcion: '', actividad: '', monto: '', activo: true
    });

    const columnasBibliografia = useMemo(() => {
        const base = ["Seleccion", "Título", "Autor/es", "Editorial", "Año", "Fecha"];
        if (puedeEditar || puedeEliminar) base.push("Acciones");
        return base;
    }, [puedeEditar, puedeEliminar]);

    const columnasEquipamiento = useMemo(() => {
        const base = ["Seleccion", "Denominacion", "Monto", "Fecha de Incorporacion", "Actividad", "Descipcion"];
        if (puedeEditar || puedeEliminar) base.push("Acciones");
        return base;
    }, [puedeEditar, puedeEliminar]);

    // --- 4. CARGA DE DATOS ---
    useEffect(() => {
        const cargarContexto = async () => {
            try {
                const planificacion = await getPlanificacion(idPlanificacion); 
                setPlanificacionActual(planificacion);

                if (planificacion && planificacion.grupoId) {
                    const datosGrupo = await getGrupo(planificacion.grupoId);
                    setGrupo(datosGrupo.datos || datosGrupo);

                    const todas = await getPlanificaciones(planificacion.grupoId);
                    const listaFinal = todas.datos || todas; 
                    setPlanificacionesMismoGrupo(
                        listaFinal.filter(p => p.id !== parseInt(idPlanificacion))
                                  .sort((a, b) => b.anio - a.anio)
                    );
                }

            } catch (error) {
                console.error("Error al cargar contexto:", error);
            }
        };
        cargarContexto();

        if (idPlanificacion) {
            if (vistaTabla === 0) obtenerBibliografia();
            else obtenerEquipamiento();
        }
    }, [idPlanificacion, vistaTabla, filtroEstado, ordenAlfabetico, busqueda, paginaActual]);

    const estaBloqueado = planificacionActual?.activo === false;

    const obtenerBibliografia = async () => {
        try {
            let direccion = ordenAlfabetico === "za" ? "desc" : "asc";
            let columna = ordenAlfabetico !== "ninguno" ? "titulo" : "id";
            const filtros = {
                busqueda: busqueda,
                activo: filtroEstado === "activos" ? "true" : (filtroEstado === "inactivos" ? "false" : "todos")
            }
            const data = await getBibliografia(idPlanificacion, paginaActual, 5, filtros, columna, direccion);
            setBibliografia(data.datos || []);
            setTotalPaginas(data.metadatos?.total_paginas || 1);
        } catch (error) { 
            sileo.error({ title: "Error al obtener la bibliografía" });
        }
    }

    const obtenerEquipamiento = async () => {
        try {
            let direccion = ordenAlfabetico === "za" ? "desc" : "asc";
            let columna = ordenAlfabetico !== "ninguno" ? "denominacion" : "id";
            const filtros = {
                busqueda: busqueda,
                activo: filtroEstado === "activos" ? "true" : (filtroEstado === "inactivos" ? "false" : "todos")
            }
            const data = await getEquipamiento(idPlanificacion, paginaActual, 5, filtros, columna, direccion);
            setEquipamiento(data.datos || []);
            setTotalPaginas(data.metadatos?.total_paginas || 1);
        } catch (error) { 
            sileo.error({ title: "Error al obtener el equipamiento" });
        }
    }

    // --- 5. LÓGICA DE IMPORTACIÓN ---
    const abrirModalImportar = () => {
        setSeleccionadosParaClonar([]);
        setPlanificacionSeleccionadaId(null);
        setFiltroAnio('');
        if (vistaTabla === 0) setBibliografiaOrigen([]);
        else setEquipamientoOrigen([]);

        setInfoModal({
            titulo: `Traer ${vistaTabla === 0 ? "Bibliografía" : "Equipamiento"} de otra Planificación`,
            tipo: 'importar'
        });
        setMostrarModal(true);
    }

    const cargarElementosOrigen = async (idPlanOrigen) => {
        if (!idPlanOrigen) return;
        try {
            if (vistaTabla === 0) {
                const data = await getBibliografia(idPlanOrigen, 1, 100, { activo: 'todos' });
                setBibliografiaOrigen(data.datos || []);
            } else {
                const data = await getEquipamiento(idPlanOrigen, 1, 100, { activo: 'todos' });
                setEquipamientoOrigen(data.datos || []);
            }
        } catch (error) {
            sileo.error({ title: "Error al cargar datos" });
        }
    }

    const handleCheckClonar = (id) => {
        setSeleccionadosParaClonar(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    }

    const confirmarImportacion = async () => {
        sileo.promise((async () => {
            const esBiblio = vistaTabla === 0;
            const origen = esBiblio ? bibliografiaOrigen : equipamientoOrigen;
            
            const promesas = seleccionadosParaClonar.map(async (idOrigen) => {
                const itemBase = origen.find(p => p.id === idOrigen);
                const { id, ...datosCopia } = itemBase;
                const payload = { ...datosCopia, planificacionId: parseInt(idPlanificacion), activo: true };
                return esBiblio ? createBibliografia(payload) : createEquipamiento(payload);
            });

            await Promise.all(promesas);
            setMostrarModal(false);
            esBiblio ? obtenerBibliografia() : obtenerEquipamiento();
        })(), {
            loading: { title: "Importando elementos..." },
            success: { title: "Importación exitosa" },
            error: { title: "Error al clonar" }
        });
    };

    // --- 6. HANDLERS UI ---
    const paginar = (n) => { 
        setPaginaActual(n); 
        setBibliografiaSeleccionadaId(null);
        setEquipamientoSeleccionadoId(null);
    };

    const handleCambioRadioButton = (id) => {
        if(vistaTabla === 0) setBibliografiaSeleccionadaId(id);
        else setEquipamientoSeleccionadoId(id);
    }

    const handleFormularioNuevo = (event) => {
        const { name, value } = event.target;
        const esModif = infoModal.tipo === 'modificar';
        if(vistaTabla === 0) {
            if (esModif) setDatosFormularioBibliografia(prev => ({...prev, [name]: value}));
            else setDatosNuevaBibliografia(prev => ({...prev, [name]: value}));
        } else {
            if (esModif) setDatosFormularioEquipamiento(prev => ({...prev, [name]: value}));
            else setDatosNuevoEquipamiento(prev => ({...prev, [name]: value}));
        }
    }

    const handleEnvio = async (event) => {
        event.preventDefault();
        const formulario = event.currentTarget;
        if(formulario.checkValidity() === false) {
            event.stopPropagation(); 
            setValidacion(true); 
            return;
        }

        // Corrección de tipos para evitar error en Python
        const datosAEnviar = vistaTabla === 0 
            ? { ...datosNuevaBibliografia, anio: parseInt(datosNuevaBibliografia.anio) || 0 }
            : { ...datosNuevoEquipamiento, monto: parseFloat(datosNuevoEquipamiento.monto) || 0 };

        sileo.promise((async () => {
            const idPlanNum = parseInt(idPlanificacion);
            if(vistaTabla === 0) {
                await createBibliografia({ ...datosAEnviar, planificacionId: idPlanNum });
                await obtenerBibliografia();
            } else {
                await createEquipamiento({ ...datosAEnviar, planificacionId: idPlanNum });
                await obtenerEquipamiento();
            }
            setMostrarModal(false); setValidacion(false);
        })(), {
            loading: { title: "Creando elemento..." },
            success: { title: "Creado con éxito" },
            error: { title: "Error al crear" }
        });
    }

    const handleActualizacion = async(event) => {
        event.preventDefault();
        const formulario = event.currentTarget;
        if(formulario.checkValidity() === false) {
            event.stopPropagation(); 
            setValidacion(true); 
            return;
        }

        const datosAEnviar = vistaTabla === 0 
            ? { ...datosFormularioBibliografia, anio: parseInt(datosFormularioBibliografia.anio) || 0 }
            : { ...datosFormularioEquipamiento, monto: parseFloat(datosFormularioEquipamiento.monto) || 0 };

        sileo.promise((async () => {
            if(vistaTabla === 0) {
                await updateBibliografia(idBibliografiaAModificar, datosAEnviar);
                await obtenerBibliografia();
            } else {
                await updateEquipamiento(idEquipamientoAModificar, datosAEnviar);
                await obtenerEquipamiento();
            }
            setMostrarModal(false);
            setValidacion(false);
        })(), {
            loading: { title: "Actualizando..." },
            success: { title: "Modificado con éxito" },
            error: { title: "Error al modificar" }
        });
    }

    const validarSeleccion = (id) => {
        const seleccionadoId = vistaTabla === 0 ? bibliografiaSeleccionadaId : equipamientoSeleccionadoId;
        if (id !== seleccionadoId) {
            sileo.warning({ title: "Selección requerida", description: "Debe seleccionar el elemento antes de realizar esta acción." });
            return false;
        }
        return true;
    };

    const handleDesvincular = async(id) => {
        if (!validarSeleccion(id)) return;
        const esBiblio = vistaTabla === 0;
        const item = esBiblio ? await getLibro(id) : await getEquipo(id);
        setConfirmacionModal({
            show: true,
            titulo: "Confirmar No Disponibilidad",
            mensaje: `¿Desea marcar a ${esBiblio ? item.titulo : item.denominacion} como no disponible?`,
            onConfirm: () => {
                sileo.promise((async () => {
                    const payload = { ...item, activo: false };
                    esBiblio ? await updateBibliografia(id, payload) : await updateEquipamiento(id, payload);
                    esBiblio ? obtenerBibliografia() : obtenerEquipamiento();
                })(), { loading: { title: "Cambiando a no disponible..." }, success: { title: "Éxito" } });
            }
        });
    }

    const handleRevincular = async(id) => {
        if (!validarSeleccion(id)) return;
        const esBiblio = vistaTabla === 0;
        const item = esBiblio ? await getLibro(id) : await getEquipo(id);
        setConfirmacionModal({
            show: true,
            titulo: "Confirmar Disponibilidad",
            mensaje: `¿Desea marcar ${esBiblio ? item.titulo : item.denominacion} como disponible ?`,
            onConfirm: () => {
                sileo.promise((async () => {
                    const payload = { ...item, activo: true };
                    esBiblio ? await updateBibliografia(id, payload) : await updateEquipamiento(id, payload);
                    esBiblio ? obtenerBibliografia() : obtenerEquipamiento();
                })(), { loading: { title: "Cambiando a disponible..." }, success: { title: "Éxito" } });
            }
        });
    }

    const handleEliminar = async (id) => {
        if (!validarSeleccion(id)) return;
        const esBiblio = vistaTabla === 0;
        const item = esBiblio ? await getLibro(id) : await getEquipo(id);
        setConfirmacionModal({
            show: true,
            titulo: "Acción Irreversible",
            mensaje: `¿Deseas eliminar permanentemente "${esBiblio ? item.titulo : item.denominacion}"?`,
            onConfirm: () => {
                sileo.promise((async () => {
                    esBiblio ? await deleteBibliografia(id) : await deleteEquipamiento(id);
                    esBiblio ? await obtenerBibliografia() : await obtenerEquipamiento();
                })(), { loading: { title: "Eliminando..." }, success: { title: "Eliminado" } });
            }
        });
    }

    const handleModificar = async(id) => {
        if (!validarSeleccion(id)) return;
        try {
            if(vistaTabla === 0) {
                const data = await getLibro(id);
                setIdBibliografiaAModificar(id);
                setDatosFormularioBibliografia({
                    titulo: data.titulo || '', autores: data.autores || '', editorial: data.editorial || '', anio: data.anio || '', fecha: data.fecha || ''
                });
                setInfoModal({ titulo: `Modificar Bibliografía`, tipo: 'modificar' });
            } else {
                const data = await getEquipo(id);
                setIdEquipamientoAModificar(id);
                setDatosFormularioEquipamiento({
                    denominacion: data.denominacion || '', fechaIngreso: data.fechaIngreso|| '', descripcion: data.descripcion || '', actividad: data.actividad || '', monto: data.monto || ''
                });
                setInfoModal({ titulo: `Modificar Equipamiento`, tipo: 'modificar' });
            }
            setValidacion(false);
            setMostrarModal(true);
        } catch (error) { sileo.error({title: "Error al cargar datos"}); }
    }

    const agregarBibliografia = () => {
        setDatosNuevaBibliografia({ titulo: '', autores: '', editorial: '', anio: '', fecha: '', activo: true });
        setValidacion(false); 
        setInfoModal({ titulo: "Agregar Bibliografía", tipo: 'agregar' }); 
        setMostrarModal(true);
    }

    const agregarEquipamiento = () => {
        setDatosNuevoEquipamiento({ denominacion: '', fechaIngreso: '', descripcion: '', actividad: '', monto: '', activo: true });
        setValidacion(false); 
        setInfoModal({ titulo: "Agregar Equipamiento", tipo: 'agregar' }); 
        setMostrarModal(true);
    }

    // --- RENDERS ---
    const datosActuales = vistaTabla === 0 ? bibliografia : equipamiento;
    const filasTablaFinal = useMemo(() => {
        return datosActuales.map(item => {
            const id = item.id;
            const estaSeleccionado = vistaTabla === 0 ? bibliografiaSeleccionadaId === id : equipamientoSeleccionadoId === id;
            const esInactivo = item.activo === false;
            const estiloFila = esInactivo ? { color: '#9e9e9e', fontStyle: 'italic' } : {};

            const celdasInfo = vistaTabla === 0 
                ? [item.titulo, item.autores, item.editorial, item.anio, item.fecha]
                : [item.denominacion, item.monto, item.fechaIngreso, item.actividad, item.descripcion];

            const celdasConEstilo = celdasInfo.map((texto, index) => <span key={index} style={estiloFila}>{texto}</span>);

            const seleccion = (
                <Form.Check 
                    type="radio" 
                    name="seleccionInventario" 
                    checked={estaSeleccionado} 
                    onChange={() => handleCambioRadioButton(id)} 
                />
            )
            
            let celdaAcciones = (puedeEditar || puedeEliminar) ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                    <PermisoAccion permisoRequerido="editar">
                        <BotonAgregar accion={() => handleModificar(id)} disabled={estaBloqueado}>
                            <img src={imagenModificar} alt="modificar" style={{width: '15px'}} />
                        </BotonAgregar>
                        <BotonAgregar accion={esInactivo ? () => handleRevincular(id) : () => handleDesvincular(id)} disabled={estaBloqueado}>
                            <img src={esInactivo ? imagenDisponible : imagenNoDisponible } alt="estado" style={{width: '15px'}} />
                        </BotonAgregar>
                    </PermisoAccion>
                    <PermisoAccion permisoRequerido="eliminar">
                        <BotonAgregar accion={() => handleEliminar(id)} disabled={estaBloqueado}>
                            <img src={imagenEliminar} alt="eliminar" style={{width: '15px'}} />
                        </BotonAgregar>
                    </PermisoAccion>
                </div>
            ) : null;

            return [seleccion, ...celdasConEstilo, celdaAcciones].filter(Boolean);
        });
    }, [datosActuales, vistaTabla, equipamientoSeleccionadoId, bibliografiaSeleccionadaId, puedeEditar, puedeEliminar, estaBloqueado]);

    const renderizarContenidoModal = () => {
        const { tipo } = infoModal;

        if (tipo === 'importar') {
            const listaOrigen = vistaTabla === 0 ? bibliografiaOrigen : equipamientoOrigen;
            const filtradas = planificacionesMismoGrupo.filter(p => p.anio.toString().includes(filtroAnio));
            return (
                <div className="modal-importar-container">
                    <Row>
                        <Col md={5} className="border-end">
                            <Form.Control 
                                type="text" placeholder="Buscar año..." size="sm" className="mb-2"
                                value={filtroAnio} onChange={(e) => setFiltroAnio(e.target.value)} 
                            />
                            <div className="lista-planificaciones border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filtradas.map(p => (
                                    <div key={p.id} className={`item-planificacion ${planificacionSeleccionadaId === p.id ? 'seleccionada' : ''}`} 
                                        onClick={() => { setPlanificacionSeleccionadaId(p.id); cargarElementosOrigen(p.id); }}
                                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: planificacionSeleccionadaId === p.id ? '#f27024' : '', color: planificacionSeleccionadaId === p.id ? 'white' : '' }}>
                                        <span>Planificación {p.anio}</span>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        <Col md={7}>
                            <div className="box-proyectos-check p-3 border rounded bg-light" style={{ maxHeight: '335px', overflowY: 'auto', minHeight: '335px' }}>
                                {listaOrigen.length > 0 ? listaOrigen.map(p => (
                                    <Form.Check key={p.id} type="checkbox" label={<strong>{vistaTabla === 0 ? p.titulo : p.denominacion}</strong>}
                                        checked={seleccionadosParaClonar.includes(p.id)} onChange={() => handleCheckClonar(p.id)} className="mb-2" />
                                )) : <p className="text-center text-muted mt-5">Selecciona un año a la izquierda.</p>}
                            </div>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                        <small className="text-muted">{seleccionadosParaClonar.length} seleccionados</small>
                        <div className="gap-2 d-flex">
                            <Button variant="danger" onClick={() => setMostrarModal(false)}>Cancelar</Button>
                            <Button onClick={confirmarImportacion} disabled={seleccionadosParaClonar.length === 0} style={{ backgroundColor: '#6b6b6b', borderColor: '#6b6b6b', color: 'white' }}>
                                Importar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }

        return vistaTabla === 0 ? (
            <FormularioBibliografia 
                data={tipo === 'agregar' ? datosNuevaBibliografia : datosFormularioBibliografia}
                handleChange={handleFormularioNuevo} 
                handler={tipo === 'agregar' ? handleEnvio : handleActualizacion} 
                isModifying={tipo === 'modificar'} 
                validacion={validacion}
            />
        ) : (
            <FormularioEquipamiento 
                data={tipo === 'agregar' ? datosNuevoEquipamiento : datosFormularioEquipamiento}
                handleChange={handleFormularioNuevo} 
                handler={tipo === 'agregar' ? handleEnvio : handleActualizacion} 
                isModifying={tipo === 'modificar'} 
                validacion={validacion}
            />
        );
    }

    return (
        <div className="inventario-layout">
            <div className="inventario-contenido">
                <div className="inventario mt-3 text-center">
                    <h1 className="mb-1 titulo-inventario">{vistaTabla === 0 ? "Bibliografía" : "Equipamiento"}</h1>
                    {grupo && <h3 className="subtitulo-grupo">Grupo {grupo.sigla} - Planificación {planificacionActual.anio}</h3>}
                </div>
            
                <div className="filtros-container mb-4 p-3 shadow-sm rounded bg-light border">
                    <div className="d-flex justify-content-between align-items-center mb-3 pb-3 border-bottom">
                        <Boton 
                            texto={"Ir a " + (vistaTabla === 0 ? "Equipamiento" : "Bibliografía")} 
                            accion={() => {setVistaTabla(vistaTabla === 0 ? 1 : 0); setPaginaActual(1);}} 
                        />
                        <div className="d-flex gap-2">
                            <PermisoAccion permisoRequerido="editar">
                                <BotonAgregar 
                                    accion={abrirModalImportar} 
                                    disabled={estaBloqueado} 
                                    className="btn-outline-secondary"
                                >
                                    Traer {vistaTabla === 0 ? "Bibliografía" : "Equipamiento"}
                                </BotonAgregar>
                            </PermisoAccion>
                            
                            <PermisoAccion permisoRequerido="editar">
                                <BotonAgregar 
                                    accion={vistaTabla === 0 ? agregarBibliografia : agregarEquipamiento} 
                                    disabled={estaBloqueado}
                                >
                                    <img src={imagenMas} alt="mas" className="me-2" style={{width: '12px'}} />
                                    Agregar {vistaTabla === 0 ? "Bibliografía" : "Equipamiento"}
                                </BotonAgregar>
                            </PermisoAccion>
                        </div>
                    </div>

                    <Row className="g-3 align-items-center">
                        <Col lg={5} md={12}>
                            <FloatingLabel 
                                label="Buscar..."
                            >
                                <Form.Control 
                                    type="text" 
                                    value={busqueda} 
                                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} 
                                />
                            </FloatingLabel>
                        </Col>
                        <Col lg={3} md={6}>
                            <FloatingLabel label="Estado">
                                <Form.Select 
                                    value={filtroEstado} 
                                    onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="activos">Disponibles</option>
                                    <option value="inactivos">No disponibles</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col lg={4} md={6}>
                            <FloatingLabel label="Ordenar por">
                                <Form.Select 
                                    value={ordenAlfabetico} 
                                    onChange={(e) => setOrdenAlfabetico(e.target.value)}
                                >
                                    <option value="ninguno">Sin orden</option>
                                    <option value="az">A a Z</option>
                                    <option value="za">Z a A</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                </div>
                
                <div className="tabla-wrapper">
                    <div className="tabla-container">
                        <Tabla 
                            columnas={vistaTabla === 0 ? columnasBibliografia : columnasEquipamiento} 
                            filas={filasTablaFinal} 
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
                                        onClick={() => paginar(i+1)}>
                                            {i+1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => paginar(paginaActual + 1)} 
                                    disabled={paginaActual === totalPaginas} 
                                />
                            </Pagination>
                        </div>
                    </div>
                    
                </div>
            </div>
            
            <div className="inventario-footer">
                <BotonAgregar accion={() => navegar("/grupo")}>
                    <img src={imagenVolver} alt="volver" style={{width: '15px'}} /> Volver
                </BotonAgregar>
            </div>

            <ModalFormularios show={mostrarModal} onHide={() => setMostrarModal(false)} titulo={infoModal.titulo}>
                {renderizarContenidoModal()}
            </ModalFormularios>

            <ModalFormularios show={confirmacionModal.show} onHide={() => setConfirmacionModal(prev => ({ ...prev, show: false }))} titulo={confirmacionModal.titulo}>
                <div className="text-center p-3">
                    <p>{confirmacionModal.mensaje}</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button variant="secondary" onClick={() => setConfirmacionModal(prev => ({ ...prev, show: false }))}>Cancelar</Button>
                        <Button style={{ backgroundColor: '#6b6b6b', borderColor: '#6b6b6b', color: 'white' }} onClick={() => { confirmacionModal.onConfirm(); setConfirmacionModal(prev => ({ ...prev, show: false })); }}>Confirmar</Button>
                    </div>
                </div>
            </ModalFormularios>
        </div> 
    )
}

export default Inventario;