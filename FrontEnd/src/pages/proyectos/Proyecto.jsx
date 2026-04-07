import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom"
import { Form, Button, Col, Row, FloatingLabel, Pagination, Modal } from 'react-bootstrap';
import { sileo } from "sileo";

//componentes
import Boton from "../../components/Boton";
import BotonAgregar from "../../components/BotonAgregar";
import Tabla from "../../components/Tabla";
import ModalFormularios from "../../components/ModalFormularios";
import FormularioProyecto from "../proyectos/FormularioProyecto"

//para acciones permitidas
import { usoDePermisos } from "../../hooks/usoDePermisos";
import { PermisoAccion } from "../../components/seguridad/PermisoAccion";

//estilos
import "./Proyecto.css";

//iconos
import imagenMas from "../../images/mas.png"
import imagenEliminar from "../../images/eliminar.png"
import imagenModificar from "../../images/modificar.png"
import imagenReanudar from "../../images/reanudar-proyecto.png"
import imagenPausar from "../../images/pausar-proyecto.png"
import imagenVolver from "../../images/volver.png";

//services
import { getProyectos, getProyecto, createProyecto, updateProyecto, deleteProyecto } from "../../services/ProyectoService";
import { getPlanificacion, getPlanificaciones } from "../../services/PlanificacionService";
import { getGrupo } from "../../services/GrupoService";

const formatearParaEnvio = (fechaString) => {
    if (!fechaString) return null;
    const fecha = new Date(fechaString);
    if (isNaN(fecha.getTime())) return null;
    return fecha.toISOString().split('T')[0]; 
};

function Proyecto() {

    // --- 1. ESTADOS DE UI Y NAVEGACIÓN ---
    const [mostrarModal, setMostrarModal] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [configConfirmar, setConfigConfirmar] = useState({ titulo: '', mensaje: '', accion: null });

    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [validacion, setValidacion] = useState(false);
    const [claveFormulario, setClaveFormulario] = useState(0);

    const [infoModal, setInfoModal] = useState({ titulo: '', tipo: null });
    const [fechaDesvinculacion, setFechaDesvinculacion] = useState("");
    const [planificacionSeleccionadaId, setPlanificacionSeleccionadaId] = useState(null);
    const [filtroAnio, setFiltroAnio] = useState('');

    const { idPlanificacion } = useParams();
    const navegar = useNavigate();
    const [grupo, setGrupo] = useState(null);

    const [planificacionActual, setPlanificacionActual] = useState(null);
    const [planificacionesMismoGrupo, setPlanificacionesMismoGrupo] = useState([]);
    const [proyectosOrigen, setProyectosOrigen] = useState([]);
    const [seleccionadosParaClonar, setSeleccionadosParaClonar] = useState([]);

    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [ordenAlfabetico, setOrdenAlfabetico] = useState("ninguno");

    // --- 2. ESTADOS DE DATOS ---
    const [proyectos, setProyectos] = useState([]);
    const [proyectoSeleccionadoId, setProyectoSeleccionadoId] = useState(null);

    // --- 3. ESTADOS DE FORMULARIOS ---
    const [idProyectoAModificar, setIdProyectoAModificar] = useState(null);

    const [datosNuevoProyecto, setDatosNuevoProyecto] = useState({
        codigo: '', 
        nombre: '', 
        tipo: '',
        fechaInicio: '', 
        fechaFin: '',
        descripcion: '', 
        logros: '', 
        dificultades: '', 
        financiamiento: '', 
        activo: ''
    });

    const [datosFormularioProyecto, setDatosFormularioProyecto] = useState({
        codigo: '', 
        nombre: '', 
        tipo: '', 
        fechaInicio: '', 
        fechaFin: '',
        descripcion: '', 
        logros: '', 
        dificultades: '', 
        financiamiento: '', 
        activo: ''
    });

    const [contenidoDetalle, setContenidoDetalle] = useState({
        campo: null, 
        contenido: '', 
        proyectoId: null
    })
    
    const { puedeEditar, puedeEliminar } = usoDePermisos();

    const columnas = useMemo(() => {
        const columnasBase = [
            "Selección", 
            "Código", 
            "Nombre", 
            "Tipo", 
            "Financiamiento", 
            "Fecha de Inicio", 
            "Fecha de Fin"
        ];
        if (puedeEditar || puedeEliminar) { columnasBase.push("Acciones"); }
        return columnasBase;
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
                        listaFinal
                            .filter(p => p.id !== parseInt(idPlanificacion))
                            .sort((a, b) => b.anio - a.anio)
                    );
                }
            } catch (error) {
                console.error("Error al cargar contexto:", error);
            }
        };
        cargarContexto();
        obtenerProyectos();
    }, [idPlanificacion, paginaActual, filtroEstado, ordenAlfabetico, busqueda]);

    const estaBloqueado = planificacionActual?.activo === false;


    // --- 5. FUNCIONES DE SERVICIO (API) ---
    const obtenerProyectos = async () => {
        try {
            let direccion = ordenAlfabetico === "za" ? "desc" : "asc";
            let columna = ordenAlfabetico !== "ninguno" ? "nombre" : "id";

            const filtrosProyecto = {
                busqueda: busqueda,
                activo: filtroEstado === "activos" ? "true" : (filtroEstado === "inactivos" ? "false" : "todos")
            };

            const data = await getProyectos(idPlanificacion, paginaActual, 5, filtrosProyecto, columna, direccion);
            setProyectos(data.datos || []);
            setTotalPaginas(data.metadatos?.total_paginas || 1);
        } catch (error) {
            sileo.error({ title: "Error al obtener los proyectos" });
        }
    };


    // --- 6. HANDLERS ---
    const handleFormularioNuevo = (event) => {
        const { name, value } = event.target;
        setDatosNuevoProyecto(prev => ({ ...prev, [name]: value }));
    };

    const handleCambioFormulario = (event) => {
        const { name, value } = event.target;
        setDatosFormularioProyecto(prev => ({ ...prev, [name]: value }));
    };

    const handleEnvio = async (event) => {
        event.preventDefault();
        const formulario = event.currentTarget;
        if (formulario.checkValidity() === false) {
            event.stopPropagation();
            setValidacion(true);
            return;
        }

        try {
            await sileo.promise(
                createProyecto({
                    ...datosNuevoProyecto,
                    planificacionId: idPlanificacion,
                    fechaInicio: formatearParaEnvio(datosNuevoProyecto.fechaInicio),
                    fechaFin: formatearParaEnvio(datosNuevoProyecto.fechaFin),
                }),
                {
                    loading: "Creando proyecto...",
                    success: "Proyecto creado con éxito",
                    error: (err) => `Error: ${err.message}`
                }
            );
            await obtenerProyectos();
            setMostrarModal(false);
            setValidacion(false);
        } catch (error) { }
    };

    const iniciarModificacion = async (id) => {
        if (id !== proyectoSeleccionadoId) {
            return sileo.warning({ title: "Selección requerida", description: "Debe seleccionar el proyecto antes de modificar." });
        }
        try {
            const proyecto = await getProyecto(id);
            setIdProyectoAModificar(id);
            setDatosFormularioProyecto({
                codigo: proyecto.codigo || '',
                nombre: proyecto.nombre || '',
                tipo: proyecto.tipo || '',
                fechaInicio: proyecto.fechaInicio || '',
                fechaFin: proyecto.fechaFin || '',
                descripcion: proyecto.descripcion || '',
                logros: proyecto.logros || '',
                dificultades: proyecto.dificultades || '',
                financiamiento: proyecto.financiamiento || '',
                activo: proyecto.activo || ''
            });
            setInfoModal({ titulo: `Modificar Proyecto: ${proyecto.nombre}`, tipo: 'modificar' });
            setMostrarModal(true);
            setValidacion(false);
        } catch (error) {
            sileo.error({ title: "Error al obtener datos", description: error.message });
        }
    };

    const handleActualizacion = async (event) => {
        if (event) event.preventDefault(); 
        if (event && event.currentTarget.checkValidity() === false) {
            event.stopPropagation();
            setValidacion(true);
            return;
        }

        if (datosFormularioProyecto.fechaFin && datosFormularioProyecto.fechaFin < datosFormularioProyecto.fechaInicio) {
            return sileo.warning({ title: "Fecha inválida", description: "La fecha de fin no puede ser anterior a la de inicio." });
        }

        try {
            await sileo.promise(
                updateProyecto(idProyectoAModificar, {
                    ...datosFormularioProyecto,
                    fechaInicio: formatearParaEnvio(datosFormularioProyecto.fechaInicio),
                    fechaFin: formatearParaEnvio(datosFormularioProyecto.fechaFin)
                }),
                {
                    loading: "Guardando cambios...",
                    success: "Proyecto actualizado con éxito",
                    error: (err) => `Error al modificar: ${err.message}`
                }
            );
            await obtenerProyectos();
            setMostrarModal(false);
            setValidacion(false);
        } catch (error) { }
    };


    // --- 7. ACCIONES DE ESTADO (ELIMINAR, VINCULAR) ---
    const handleEliminar = async (id) => {
        if (id !== proyectoSeleccionadoId) {
            return sileo.warning({ title: "Selección requerida", description: "Debe seleccionar el proyecto antes de eliminar." });
        }
        const proyecto = await getProyecto(id);
        setConfigConfirmar({
            titulo: 'Eliminar Proyecto',
            mensaje: `¿Estás seguro de que deseas eliminar permanentemente "${proyecto.nombre}"? Esta acción es irreversible.`,
            accion: () => confirmarEliminacion(id)
        });
        setMostrarConfirmar(true);
    };

    const confirmarEliminacion = async (id) => {
        try {
            await sileo.promise(deleteProyecto(id), {
                loading: "Eliminando...",
                success: "Proyecto eliminado",
                error: "Error al eliminar"
            });
            if (proyectos.length === 1 && paginaActual > 1) { setPaginaActual(prev => prev - 1); }
            else { await obtenerProyectos(); }
            setProyectoSeleccionadoId(null);
            setMostrarConfirmar(false);
        } catch (error) { }
    };

    const handleRevincular = async (idProyecto) => {
        if (idProyecto !== proyectoSeleccionadoId) {
            return sileo.warning({ title: "Selección requerida", description: "Debe seleccionar el proyecto antes de reanudarlo." });
        }
        const proyecto = await getProyecto(idProyecto);
        setConfigConfirmar({
            titulo: 'Reanudar Proyecto',
            mensaje: `¿Desea reanudar el proyecto ${proyecto.nombre}?`,
            accion: () => confirmarRevincular(idProyecto, proyecto)
        });
        setMostrarConfirmar(true);
    };

    const confirmarRevincular = async (idProyecto, proyecto) => {
        try {
            await sileo.promise(updateProyecto(idProyecto, { ...proyecto, activo: true }), {
                loading: "Reanudando...",
                success: `¡Proyecto ${proyecto.nombre} reanudado!`,
                error: "Error al reanudar"
            });
            await obtenerProyectos();
            setMostrarConfirmar(false);
        } catch (error) { }
    };

    const recuperarFechaDesvincular = (idProyecto) => {
        if (idProyecto !== proyectoSeleccionadoId) {
            return sileo.warning({ title: "Selección requerida", description: "Debe seleccionar el proyecto antes de pausarlo." });
        }
        const proyecto = proyectos.find(p => p.id === idProyecto);
        if (!proyecto) return;
        setFechaDesvinculacion(proyecto.fechaFin || new Date().toISOString().split('T')[0]);
        setProyectoSeleccionadoId(idProyecto);
        setInfoModal({ titulo: `Pausar Proyecto: ${proyecto.nombre}`, tipo: 'desvincular' });
        setMostrarModal(true);
    };

    const confirmarDesvincular = async (idProyecto) => {
        try {
            const proyecto = await getProyecto(idProyecto);
            const hoy = new Date().toISOString().split('T')[0];
            
            if (fechaDesvinculacion > hoy || (proyecto.fechaInicio && fechaDesvinculacion < proyecto.fechaInicio)) {
                return sileo.warning({ title: "Fecha inválida", description: "La fecha no puede ser futura ni anterior al inicio." });
            }

            await sileo.promise(
                updateProyecto(idProyecto, { ...proyecto, fechaFin: fechaDesvinculacion, activo: false }),
                {
                    loading: "Desvinculando...",
                    success: "Proyecto pausado",
                    error: "Error al pausar"
                }
            );
            await obtenerProyectos();
            setMostrarModal(false);
        } catch (error) { }
    };


    // --- 8. IMPORTACIÓN ---
    const abrirModalImportar = () => {
        setProyectosOrigen([]);
        setSeleccionadosParaClonar([]);
        setPlanificacionSeleccionadaId(null);
        setFiltroAnio('');
        setInfoModal({ titulo: "Importar Proyectos", tipo: 'importar' });
        setMostrarModal(true);
    };

    const cargarProyectosOrigen = async (idPlanificacionOrigen) => {
        if (!idPlanificacionOrigen) return;
        try {
            const data = await getProyectos(idPlanificacionOrigen, 1, 100, { activo: 'todos' });
            setProyectosOrigen(data.datos || []);
        } catch (error) {
            sileo.error({ title: "Error al cargar proyectos de origen" });
        }
    };

    const confirmarImportacion = async () => {
        try {
            const promesas = seleccionadosParaClonar.map(async (idOrigen) => {
                const pBase = proyectosOrigen.find(p => p.id === idOrigen);
                const { id, ...datosCopia } = pBase;
                return createProyecto({ ...datosCopia, planificacionId: idPlanificacion, activo: true });
            });
            await sileo.promise(Promise.all(promesas), {
                loading: "Importando proyectos...",
                success: "Proyectos importados con éxito",
                error: "Error al importar"
            });
            setMostrarModal(false);
            obtenerProyectos();
        } catch (error) { }
    };

    // --- 9. RENDERIZADO ---
    const filasTabla = proyectos.map(item => {
        const esInactivo = item.activo === false;
        const estiloFila = esInactivo ? { color: '#9e9e9e', fontStyle: 'italic' } : {};

        let celdaAcciones = (puedeEditar || puedeEliminar) ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                <PermisoAccion permisoRequerido="editar">
                    <BotonAgregar 
                        accion={() => iniciarModificacion(item.id)} 
                        disabled={estaBloqueado}
                    >
                        <img src={imagenModificar} alt="modificar" style={{width: '15px'}} />
                    </BotonAgregar>
                    <BotonAgregar 
                        accion={esInactivo ? () => handleRevincular(item.id) : () => recuperarFechaDesvincular(item.id)} 
                        disabled={estaBloqueado}
                    >
                        <img src={esInactivo ? imagenReanudar : imagenPausar} alt="vincular" style={{width: '15px'}} />
                    </BotonAgregar>
                </PermisoAccion>
                <PermisoAccion permisoRequerido="eliminar">
                    <BotonAgregar 
                        accion={() => handleEliminar(item.id)} 
                        disabled={estaBloqueado}
                    >
                        <img src={imagenEliminar} alt="eliminar" style={{width: '15px'}} />
                    </BotonAgregar>
                </PermisoAccion>
            </div>
        ) : null;

        return [
            <Form.Check 
                type="radio" 
                name="proyectoSelection" 
                checked={proyectoSeleccionadoId === item.id} 
                onChange={() => setProyectoSeleccionadoId(item.id)} 
            />,
            <span style={estiloFila}>{item.codigo}</span>,
            <span style={estiloFila}>{item.nombre}</span>,
            <span style={estiloFila}>{item.tipo}</span>,
            <span style={estiloFila}>{item.financiamiento}</span>,
            <span style={estiloFila}>{item.fechaInicio}</span>,
            <span style={estiloFila}>{item.fechaFin || "-"}</span>,
            celdaAcciones
        ].filter(Boolean);
    });

    const renderizarContenidoModal = () => {
        const { tipo } = infoModal;
        if (tipo === 'agregar' || tipo === 'modificar') {
            return (
                <Form 
                    onSubmit={tipo === 'agregar' ? handleEnvio : handleActualizacion} 
                    key={claveFormulario} 
                    noValidate 
                    validated={validacion}
                >
                    <FormularioProyecto 
                        data={tipo === 'agregar' ? datosNuevoProyecto : datosFormularioProyecto} 
                        handleChange={tipo === 'agregar' ? handleFormularioNuevo : handleCambioFormulario} 
                        isModifying={tipo === 'modificar'} 
                        validacion={validacion} 
                    />
                </Form>
            );
        }
        if (tipo === 'desvincular') {
            return (
                <Form onSubmit={(e) => { e.preventDefault(); confirmarDesvincular(proyectoSeleccionadoId); }}>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha de desvinculación</Form.Label>
                        <Form.Control 
                            type="date" 
                            value={fechaDesvinculacion} 
                            onChange={(e) => setFechaDesvinculacion(e.target.value)} 
                            required 
                        />
                    </Form.Group>
                    <div style={{ textAlign: 'right' }}>
                        <Button type="submit" style={{ backgroundColor: '#6b6b6b', borderColor: '#6b6b6b' }}>
                            Confirmar
                        </Button>
                    </div>
                </Form>
            );
        }
        if (tipo === 'importar') {
            const filtradas = planificacionesMismoGrupo.filter(p => p.anio.toString().includes(filtroAnio));
            return (
                <div className="modal-importar-container">
                    <Row>
                        <Col md={5} className="border-end">
                            <Form.Control 
                                type="text" 
                                placeholder="Buscar año..." 
                                size="sm" 
                                value={filtroAnio} 
                                onChange={(e) => setFiltroAnio(e.target.value)} className="mb-2" 
                            />
                            <div className="lista-planificaciones border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filtradas.map(p => (
                                    <div key={p.id} className={`item-planificacion ${planificacionSeleccionadaId === p.id ? 'seleccionada' : ''}`} 
                                        onClick={() => { setPlanificacionSeleccionadaId(p.id); cargarProyectosOrigen(p.id); }}
                                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: planificacionSeleccionadaId === p.id ? '#f27024' : '', color: planificacionSeleccionadaId === p.id ? 'white' : '' }}>
                                        <span>Planificación {p.anio}</span>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        <Col md={7}>
                            <div 
                                className="box-proyectos-check p-3 border rounded bg-light" 
                                style={{ maxHeight: '335px', overflowY: 'auto', minHeight: '335px' }}
                            >
                                {proyectosOrigen.length > 0 ? proyectosOrigen.map(p => (
                                    <Form.Check 
                                        key={p.id} 
                                        type="checkbox" 
                                        label={<div><strong>{p.codigo}</strong> - {p.nombre}</div>} 
                                        checked={seleccionadosParaClonar.includes(p.id)} 
                                        onChange={() => setSeleccionadosParaClonar(prev => prev.includes(p.id) ? prev.filter(x => x !== p.id) : [...prev, p.id])} 
                                        className="mb-2" 
                                    />
                                )) : <p className="text-center text-muted mt-5">Selecciona un año a la izquierda.</p>}
                            </div>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                        <small className="text-muted">{seleccionadosParaClonar.length} seleccionados</small>
                        <div className="gap-2 d-flex">
                            <Button 
                                variant="danger" 
                                onClick={() => setMostrarModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                variant="button" 
                                onClick={confirmarImportacion} 
                                disabled={seleccionadosParaClonar.length === 0}
                                style={{'backgroundColor': '#6b6b6b', 'borderColor': '#6b6b6b'}}
                            >
                                Importar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
        if (tipo === 'verDetalle') {
            return (
                <div className="detalle-texto-container">
                    <p style={{ whiteSpace: 'pre-wrap', padding: '10px', border: '1px solid #ccc', backgroundColor: '#f8f9fa' }}>
                        {contenidoDetalle.contenido || "Vacío."}
                    </p>
                </div>
            )
        }
        return null;
    };

    const obtenerYAbrirModalDetalle = (campoUI, tituloModal) => {
        if (!proyectoSeleccionadoId) { return sileo.warning({ title: "Atención", description: "Selecciona un proyecto primero." }); }
        const mapping = { logros: 'logros', descripcion: 'descripcion', dificultades: 'dificultades' };
        const campoJSON = mapping[campoUI];
        const proyecto = proyectos.find(p => p.id === proyectoSeleccionadoId);
        setContenidoDetalle({ campo: campoJSON, contenido: proyecto[campoJSON] || "", proyectoId: proyectoSeleccionadoId });
        setInfoModal({ titulo: tituloModal, tipo: 'verDetalle' });
        setMostrarModal(true);
    };

    return (
        <div className="proyectos-layout">
            <div className="proyecto-contenido">
                <div className="proyecto mt-3 text-center">
                    <h1 className="mb-1 titulo-proyecto"> Proyectos </h1>
                    {grupo && <h3 className="subtitulo-grupo">Grupo {grupo.sigla} - Planificación {planificacionActual.anio}</h3>}
                </div>
                <div className="filtros-container mb-4 p-3 shadow-sm rounded bg-light border">
                    <div className="d-flex justify-content-end gap-2 mb-3 pb-3 border-bottom">
                        <PermisoAccion permisoRequerido="editar">
                            <BotonAgregar 
                                accion={abrirModalImportar} 
                                disabled={estaBloqueado} 
                                className="btn-outline-secondary"
                            >
                                Traer Proyectos
                            </BotonAgregar>
                        </PermisoAccion>
                        
                        <PermisoAccion permisoRequerido="editar">
                            <BotonAgregar 
                                accion={() => { setDatosNuevoProyecto({ codigo: '', nombre: '', tipo: '', fechaInicio: '', fechaFin: '', descripcion: '', logros: '', dificultades: '', financiamiento: '', activo: true }); setValidacion(false); setClaveFormulario(p => p + 1); setInfoModal({ titulo: "Agregar Proyecto", tipo: 'agregar' }); setMostrarModal(true); }} 
                                disabled={estaBloqueado}>
                                    <img src={imagenMas} alt="mas" className="me-2" style={{width: '12px'}}
                                />
                                Nuevo Proyecto
                            </BotonAgregar>
                        </PermisoAccion>
                    </div>
                    <Row className="g-3 align-items-center">
                        <Col lg={5}>
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
                        <Col lg={3}>
                            <FloatingLabel 
                                label="Estado"
                            >
                                <Form.Select 
                                    value={filtroEstado} 
                                    onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}
                                >
                                    <option value="todos">Todos</option>
                                    <option value="activos">Activos</option>
                                    <option value="inactivos">Inactivos</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col lg={4}>
                            <FloatingLabel 
                                label="Ordenar"
                            >
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
                            columnas={columnas} 
                            filas={filasTabla} 
                        />
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev 
                                    onClick={() => setPaginaActual(p => p - 1)} 
                                    disabled={paginaActual === 1} 
                                />
                                {[...Array(totalPaginas)].map((_, i) => (
                                    <Pagination.Item 
                                        key={i + 1} 
                                        active={i + 1 === paginaActual} 
                                        onClick={() => setPaginaActual(i + 1)}
                                    >
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next 
                                    onClick={() => setPaginaActual(p => p + 1)} 
                                    disabled={paginaActual === totalPaginas}
                                />
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>
            <div className="proyecto-footer">
                <BotonAgregar 
                    accion={() => navegar("/grupo")}
                >
                    <img src={imagenVolver} alt="volver" style={{ width: '15px' }} />
                    Volver
                </BotonAgregar>
                <Boton 
                    texto="Ver Logros" 
                    accion={() => obtenerYAbrirModalDetalle('logros', 'Logros del Proyecto')} 
                />
                <Boton 
                    texto="Ver Descripcion" 
                    accion={() => obtenerYAbrirModalDetalle('descripcion', 'Descripción del Proyecto')} 
                />
                <Boton 
                    texto="Ver Dificultades" 
                    accion={() => obtenerYAbrirModalDetalle('dificultades', 'Dificultades del Proyecto')} 
                />
            </div>
            <ModalFormularios 
                show={mostrarModal} 
                onHide={() => setMostrarModal(false)} 
                titulo={infoModal.titulo}>{renderizarContenidoModal()}
            </ModalFormularios>
            <Modal 
                show={mostrarConfirmar} 
                onHide={() => setMostrarConfirmar(false)} 
                centered
            >
                <Modal.Header 
                    closeButton
                >
                    <Modal.Title>
                        {configConfirmar.titulo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {configConfirmar.mensaje}
                </Modal.Body>
                <Modal.Footer>
                    <Button 
                        variant="secondary" 
                        onClick={() => setMostrarConfirmar(false)}
                    >
                        Cancelar
                    </Button>
                    <Button 
                        onClick={configConfirmar.accion} 
                        style={{ backgroundColor: '#6b6b6b', borderColor: '#6b6b6b' }}
                    >
                        Confirmar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Proyecto;