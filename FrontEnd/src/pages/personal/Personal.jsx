// --- 1. IMPORTACIONES ---
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Form, Button, Col, Row, FloatingLabel, Pagination } from 'react-bootstrap';
import { sileo } from "sileo";

// componentes
import Boton from "../../components/Boton";
import BotonAgregar from "../../components/BotonAgregar";
import Tabla from "../../components/Tabla";
import ModalFormularios from "../../components/ModalFormularios";
import FormularioPersonal from "./FormularioPersonal";

// para los permisos de acciones
import { usoDePermisos } from "../../hooks/usoDePermisos";
import { PermisoAccion } from "../../components/seguridad/PermisoAccion";

// estilos
import "./Personal.css";
import imagenModificar from "../../images/modificar.png";
import imagenMas from "../../images/mas.png";
import imagenVincular from "../../images/revincular-persona.png";
import imagenDesvincular from "../../images/desvincular-persona.png";
import imagenVolver from "../../images/volver.png";
import imagenEliminar from "../../images/eliminar.png";

// services
import { getPersona, updatePersona, createPersona } from "../../services/PersonaService";
import { getIntegrante, getPersonal, createPersonal, updatePersonal, deletePersonal } from "../../services/PersonalService";
import { getPlanificacion, getPlanificaciones } from "../../services/PlanificacionService";
import { getGrupo } from "../../services/GrupoService";

function Personal() {
    // --- 2. ESTADOS ---
    const [mostrarModal, setMostrarModal] = useState(false);
    const { puedeEditar, puedeEliminar } = usoDePermisos();

    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [validacion, setValidacion] = useState(false);
    const [claveFormulario, setClaveFormulario] = useState(0);
    const [infoModal, setInfoModal] = useState({ titulo: '', tipo: null });

    const [vistaConsulta, setVistaConsulta] = useState(false);

    const [confirmacionModal, setConfirmacionModal] = useState({
        show: false,
        titulo: '',
        mensaje: '',
        onConfirm: () => { }
    });

    const { idPlanificacion } = useParams();
    const navegar = useNavigate();
    const [grupo, setGrupo] = useState(null);
    const [busqueda, setBusqueda] = useState("");
    const [filtroTipoPersonal, setFiltroTipoPersonal] = useState("TODOS");
    const [filtroEstado, setFiltroEstado] = useState("todos");
    const [ordenAlfabetico, setOrdenAlfabetico] = useState("ninguno");

    const [planificacionActual, setPlanificacionActual] = useState(null);
    const [planificacionesMismoGrupo, setPlanificacionesMismoGrupo] = useState([]);
    const [personalOrigen, setPersonalOrigen] = useState([]);
    const [seleccionadosParaClonar, setSeleccionadosParaClonar] = useState([]);
    const [planificacionSeleccionadaId, setPlanificacionSeleccionadaId] = useState(null);
    const [filtroAnio, setFiltroAnio] = useState('');

    const [listaPersonal, setListaPersonal] = useState([]);
    const [personalSeleccionadoId, setPersonalSeleccionadoId] = useState(null);
    const [idADesvincular, setIdAdesvincular] = useState(null);
    const [idPersonalAModificar, setIdPersonalAModificar] = useState(null);

    const [datosFormularioPersonal, setDatosFormularioPersonal] = useState({
        nombre: '',
        apellido: '',
        tipoDocumento: '',
        numeroDocumento: '',
        activo: '',
        nacionalidad: '',
        tipoPersonal: '',
        horas: '',
        categoria: '',
        incentivo: '',
        dedicacion: '',
        rol: '',
        formacionBecario: '',
        fechaInicio: '',
        fechaFin: '',
        financiamiento: ''
    });

    // --- 3. FUNCIONES AUXILIARES ---
    const capitalizar = (texto) => {
        if (!texto) return '';
        return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
    };

    const formatearFecha = (fechaString) => {
        if (!fechaString) return "";
        const fecha = new Date(fechaString);
        if (isNaN(fecha.getTime())) return "";
        return fecha.toISOString().split('T')[0];
    };

    const validarFechas = (fechaInicio, fechaFin) => {
        const hoy = new Date().toISOString().split('T')[0];
        if (fechaFin > hoy) {
            sileo.warning({ title: "Fecha inválida", description: "La fecha de fin no puede ser posterior a hoy" });
            return false;
        }
        if (fechaInicio && fechaFin < fechaInicio) {
            sileo.warning({ title: "Fecha inválida", description: "La fecha de fin no puede ser anterior a la de inicio" });
            return false;
        }
        return true;
    };

    // --- 4. EFECTOS Y CARGA ---
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
            } catch (error) { console.error(error); }
        };
        cargarContexto();
        cargarTodo();
    }, [idPlanificacion, paginaActual, filtroEstado, ordenAlfabetico, busqueda, filtroTipoPersonal]);

    const estaBloqueado = planificacionActual?.activo === false;

    // --- 5. FUNCIONES DE SERVICIO (API) ---
    const cargarTodo = async () => {
        let direccion = ordenAlfabetico === "za" ? "desc" : "asc";
        let columna = ordenAlfabetico === "ninguno" ? "id" : "apellido";
        const filtrosPersonal = {
            busqueda: busqueda,
            activo: filtroEstado === "activos" ? "true" : (filtroEstado === "inactivos" ? "false" : "todos"),
            tipo: filtroTipoPersonal
        };
        try {
            const dataPersonal = await getPersonal(idPlanificacion, paginaActual, 5, filtrosPersonal, columna, direccion);
            setListaPersonal(dataPersonal.datos || []);
            setTotalPaginas(dataPersonal.metadatos?.total_paginas || 1);
        } catch (error) { sileo.error({ title: "Error al cargar personal" }); }
    };

    // --- 6. HANDLERS MODALES ---
    const abrirModalAgregar = () => {
        setDatosFormularioPersonal({
            nombre: '',
            apellido: '',
            tipoDocumento: '',
            numeroDocumento: '',
            nacionalidad: '',
            tipoPersonal: 'TODOS',
            horas: '',
            categoria: '',
            incentivo: '',
            dedicacion: '',
            rol: '',
            formacionBecario: '',
            fechaInicio: '',
            fechaFin: '',
            financiamiento: ''
        });
        setInfoModal({ titulo: "Nuevo Personal", tipo: 'agregar' });
        setValidacion(false);
        setClaveFormulario(prev => prev + 1);
        setMostrarModal(true);
    };

    const abrirModalDesvincular = (id) => {
        setIdAdesvincular(id);
        setDatosFormularioPersonal({ fechaFin: new Date().toISOString().split('T')[0] });
        setInfoModal({ titulo: "Establecer Fecha de Finalización", tipo: 'desvincular' });
        setMostrarModal(true);
    };

    const abrirModalImportar = () => {
        setPersonalOrigen([]);
        setSeleccionadosParaClonar([]);
        setPlanificacionSeleccionadaId(null);
        setFiltroAnio('');
        setInfoModal({ titulo: "Importar Personal", tipo: 'importar' });
        setMostrarModal(true);
    };

    const cargarPersonalOrigen = async (idPlanOrigen) => {
        if (!idPlanOrigen) return;
        try {
            const data = await getPersonal(idPlanOrigen, 1, 100, { activo: 'todos' });
            setPersonalOrigen(data.datos || []);
        } catch (error) { sileo.error({ title: "Error al obtener personal de origen" }); }
    };

    const confirmarImportacion = async () => {

        const personasYaVinculadas = seleccionadosParaClonar.filter(idRegistroPersonal => {
            const origen = personalOrigen.find(p => p.id === idRegistroPersonal)
            return listaPersonal.some(actual => actual.numeroDocumento === origen?.numeroDocumento);
        })

        if (personasYaVinculadas.length > 0) {
            const nombresDuplicados = personasYaVinculadas.map(idRegistroPersonal => {
                const personaDuplicada = personaOrigen.find(personaDuplicada => personaDuplicada.id === idRegistroPersonal)
                return `${personaDuplicada.apellido}, ${personaDuplicada.nombre}`
            }).join(", ")

            return sileo.error({
                title: "Personal duplicado",
                description: `Las siguientes personas ya forman parte de esta planificación: ${nombresDuplicados}`
            });
        }

        sileo.promise((async () => {
            const promesas = seleccionadosParaClonar.map(async (idRegistroPersonal) => {
                const pBase = personalOrigen.find(p => p.id === idRegistroPersonal);
                const { id, ...datosCopia } = pBase;
                return createPersonal({ ...datosCopia, planificacionId: idPlanificacion, fechaFin: null, activo: true });
            });
            await Promise.all(promesas);
            await cargarTodo();
            setMostrarModal(false);
        })(), {
            loading: { title: "Importando personal..." },
            success: { title: "¡Éxito!", description: "Personal importado correctamente" },
            error: { title: "Error al importar" }
        });
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDatosFormularioPersonal(prev => ({ ...prev, [name]: value }));
    };

    const handleEnvio = async (event) => {
        const formulario = event.currentTarget;
        if (formulario.checkValidity() === false) { event.preventDefault(); event.stopPropagation(); setValidacion(true); return; }
        event.preventDefault();

        sileo.promise((async () => {
            const nuevaPersona = await createPersona({
                nombre: capitalizar(datosFormularioPersonal.nombre),
                apellido: capitalizar(datosFormularioPersonal.apellido),
                tipoDocumento: datosFormularioPersonal.tipoDocumento,
                numeroDocumento: datosFormularioPersonal.numeroDocumento,
                nacionalidad: capitalizar(datosFormularioPersonal.nacionalidad),
                activo: true
            });
            await createPersonal({
                personaId: nuevaPersona.persona.id, planificacionId: idPlanificacion,
                objectType: datosFormularioPersonal.tipoPersonal.toUpperCase(),
                horas: parseInt(datosFormularioPersonal.horas), fechaInicio: datosFormularioPersonal.fechaInicio,
                fechaFin: datosFormularioPersonal.fechaFin || null, financiamiento: datosFormularioPersonal.financiamiento,
                categoria: datosFormularioPersonal.categoria?.toUpperCase() || null, incentivo: datosFormularioPersonal.incentivo || null,
                dedicacion: datosFormularioPersonal.dedicacion?.toUpperCase() || null, rol: datosFormularioPersonal.rol?.toUpperCase() || null,
                formacionBecario: datosFormularioPersonal.formacionBecario?.toUpperCase() || null
            });
            await cargarTodo();
            setMostrarModal(false); setValidacion(false);
        })(), { loading: { title: "Agregando..." }, success: { title: "¡Éxito!" } });
    };

    const handleActualizacion = async (event) => {
        event.preventDefault();
        const formulario = event.currentTarget;
        if (formulario.checkValidity() === false) { event.stopPropagation(); setValidacion(true); return; }

        sileo.promise((async () => {
            const personal = await getIntegrante(idPersonalAModificar);
            await updatePersona(personal.personaId, {
                nombre: capitalizar(datosFormularioPersonal.nombre),
                apellido: capitalizar(datosFormularioPersonal.apellido),
                tipoDocumento: datosFormularioPersonal.tipoDocumento,
                numeroDocumento: datosFormularioPersonal.numeroDocumento,
                nacionalidad: capitalizar(datosFormularioPersonal.nacionalidad),
                activo: true
            });
            await updatePersonal(idPersonalAModificar, {
                personaId: personal.personaId, planificacionId: idPlanificacion,
                objectType: datosFormularioPersonal.tipoPersonal.toUpperCase(),
                horas: parseInt(datosFormularioPersonal.horas), fechaInicio: datosFormularioPersonal.fechaInicio,
                fechaFin: datosFormularioPersonal.fechaFin || null, rol: datosFormularioPersonal.rol?.toUpperCase() || null,
                categoria: datosFormularioPersonal.categoria?.toUpperCase() || null, dedicacion: datosFormularioPersonal.dedicacion?.toUpperCase() || null,
                formacionBecario: datosFormularioPersonal.formacionBecario?.toUpperCase() || null, financiamiento: datosFormularioPersonal.financiamiento || null,
                incentivo: datosFormularioPersonal.incentivo || null
            });
            await cargarTodo();
            setMostrarModal(false); setIdPersonalAModificar(null); setValidacion(false);
        })(), { loading: { title: "Actualizando..." }, success: { title: "Datos actualizados" } });
    };

    // --- 7. ACCIONES TABLA ---
    const handleEliminar = async (id) => {
        if (id !== personalSeleccionadoId) return sileo.warning({ title: "Selección requerida", description: "Seleccione a la persona en la tabla." });
        const personal = await getIntegrante(id);
        const persona = await getPersona(personal.personaId);
        setConfirmacionModal({
            show: true, titulo: "Acción Irreversible", mensaje: `¿Eliminar a ${persona.nombre} ${persona.apellido}?`,
            onConfirm: () => {
                sileo.promise((async () => { await deletePersonal(id); await cargarTodo(); setPersonalSeleccionadoId(null); })(), { loading: { title: "Eliminando..." } });
            }
        });
    };

    const handleRevincular = async (idPersonal) => {
        if (idPersonal !== personalSeleccionadoId) return sileo.warning({ title: "Selección requerida", description: "Seleccione a la persona en la tabla." });
        setConfirmacionModal({
            show: true, titulo: "Confirmar Revinculación", mensaje: "¿Desea volver a vincular a esta persona?",
            onConfirm: () => {
                sileo.promise((async () => {
                    const integrante = await getIntegrante(idPersonal);
                    await updatePersonal(idPersonal, { ...integrante, fechaFin: null });
                    await updatePersona(integrante.personaId, { activo: true });
                    await cargarTodo();
                })(), { loading: { title: "Revinculando..." } });
            }
        });
    };

    const prepararDesvinculacion = (id) => {
        if (id !== personalSeleccionadoId) return sileo.warning({ title: "Selección requerida", description: "Seleccione a la persona en la tabla." });
        setIdAdesvincular(id);
        setDatosFormularioPersonal(prev => ({ ...prev, fechaFin: new Date().toISOString().split('T')[0] }));
        setInfoModal({ titulo: "Establecer Fecha Fin", tipo: 'desvincular' });
        setMostrarModal(true);
    };

    const confirmarDesvincular = async (event) => {
        event.preventDefault();
        const personal = await getIntegrante(idADesvincular);
        if (!validarFechas(personal.fechaInicio, datosFormularioPersonal.fechaFin)) return;
        sileo.promise((async () => {
            await updatePersonal(idADesvincular, { ...personal, fechaFin: datosFormularioPersonal.fechaFin });
            await updatePersona(personal.personaId, { activo: false });
            await cargarTodo();
            setMostrarModal(false);
        })(), { loading: { title: "Procesando..." } });
    };

    const iniciarModificacion = async (id) => {
        if (id !== personalSeleccionadoId) return sileo.warning({ title: "Selección requerida", description: "Seleccione a la persona en la tabla." });
        try {
            const personal = await getIntegrante(id);
            const persona = await getPersona(personal.personaId);
            setIdPersonalAModificar(id);
            setDatosFormularioPersonal({
                nombre: persona.nombre || '', apellido: persona.apellido || '',
                tipoDocumento: persona.tipoDocumento || '', numeroDocumento: persona.numeroDocumento || '',
                nacionalidad: persona.nacionalidad || '', tipoPersonal: personal.objectType || '',
                horas: personal.horas || '', fechaInicio: formatearFecha(personal.fechaInicio),
                fechaFin: formatearFecha(personal.fechaFin) || '', rol: personal.rol || '',
                categoria: personal.categoria || '', dedicacion: personal.dedicacion || '',
                formacionBecario: personal.formacionBecario || '', financiamiento: personal.financiamiento || '',
                incentivo: personal.incentivo || ''
            });
            setInfoModal({ titulo: `Modificar: ${persona.nombre} ${persona.apellido}`, tipo: 'modificar' });
            setMostrarModal(true);
        } catch (error) { sileo.error({ title: "Error al cargar datos" }); }
    };

    // --- 8. DEFINICIÓN DE TABLAS (USO DE MEMO) ---

    const columnasGestion = useMemo(() => {
        const base = ["Selección", "Nombre", "Apellido", "Horas Semanales", "Tipo"];
        if (filtroTipoPersonal === "BECARIO") base.push("Formación", "Financiamiento");
        else if (filtroTipoPersonal === "INVESTIGADOR") base.push("Categoría", "Dedicación", "Incentivo");
        else if (filtroTipoPersonal === "SOPORTE" || filtroTipoPersonal === "VISITANTE") base.push("Rol");
        else base.push("Fecha de Ingreso", "Fecha de Fin");
        if (puedeEditar || puedeEliminar) base.push("Acciones");
        return base;
    }, [filtroTipoPersonal, puedeEditar, puedeEliminar]);

    const filasGestion = listaPersonal.map(item => {
        const esInactivo = item.activo === false;
        const estiloFila = esInactivo ? { color: '#9e9e9e', fontStyle: 'italic' } : {};
        let fila = [
            <Form.Check type="radio" checked={personalSeleccionadoId === item.id} onChange={() => setPersonalSeleccionadoId(item.id)} />,
            <span style={estiloFila}>{item.nombre}</span>,
            <span style={estiloFila}>{item.apellido}</span>,
            <span style={estiloFila}>{item.horas}</span>,
            <span style={estiloFila}>{capitalizar(item.objectType)}</span>
        ];

        if (filtroTipoPersonal === "BECARIO") fila.push(<span style={estiloFila}>{capitalizar(item.formacionBecario || '-')}</span>, <span style={estiloFila}>{item.financiamiento || '-'}</span>);
        else if (filtroTipoPersonal === "INVESTIGADOR") fila.push(<span style={estiloFila}>{item.categoria || '-'}</span>, <span style={estiloFila}>{capitalizar(item.dedicacion || '-')}</span>, <span style={estiloFila}>{item.incentivo ? 'Sí' : 'No'}</span>);
        else if (filtroTipoPersonal === "SOPORTE" || filtroTipoPersonal === "VISITANTE") fila.push(<span style={estiloFila}>{capitalizar(item.rol || '-')}</span>);
        else fila.push(<span style={estiloFila}>{formatearFecha(item.fechaInicio)}</span>, <span style={estiloFila}>{formatearFecha(item.fechaFin) || '-'}</span>);

        if (puedeEditar || puedeEliminar) {
            fila.push(
                <div style={{ display: 'flex', justifyContent: 'center', gap: '3px' }}>
                    <PermisoAccion permisoRequerido="editar">
                        <BotonAgregar
                            accion={() => iniciarModificacion(item.id)}
                            disabled={estaBloqueado}
                        >
                            <img src={imagenModificar} alt="modificar" style={{ width: '15px' }} />
                        </BotonAgregar>
                        <BotonAgregar
                            accion={esInactivo ? () => handleRevincular(item.id) : () => prepararDesvinculacion(item.id)}
                            disabled={estaBloqueado}
                        >
                            <img src={esInactivo ? imagenVincular : imagenDesvincular} style={{ width: '15px' }} />
                        </BotonAgregar>
                    </PermisoAccion>
                    <PermisoAccion permisoRequerido="eliminar">
                        <BotonAgregar
                            accion={() => handleEliminar(item.id)}
                            disabled={estaBloqueado}
                        >
                            <img src={imagenEliminar} alt="eliminar" style={{ width: '15px' }} />
                        </BotonAgregar>
                    </PermisoAccion>
                </div>
            );
        }
        return fila;
    });

    const columnasConsulta = ["Nombre", "Apellido", "Tipo de Documento", "Nº Documento", "Nacionalidad", "Tipo Personal"];
    const filasConsulta = listaPersonal.map(item => [
        item.nombre,
        item.apellido,
        item.tipoDocumento || "-",
        item.numeroDocumento || "-",
        item.nacionalidad || "-",
        capitalizar(item.objectType)
    ]);

    const renderizarContenidoModal = () => {
        const { tipo } = infoModal;
        if (tipo === 'desvincular') return (
            <Form onSubmit={confirmarDesvincular}>
                <FloatingLabel
                    label="Fecha de Fin"
                    className="mb-3"
                >
                    <Form.Control
                        type="date"
                        name="fechaFin"
                        required
                        max={new Date().toISOString().split('T')[0]}
                        value={datosFormularioPersonal.fechaFin}
                        onChange={handleChange}
                    />
                </FloatingLabel>
                <div className="d-flex justify-content-end gap-2">
                    <Button
                        variant="danger"
                        onClick={() => setMostrarModal(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        style={{ backgroundColor: '#6b6b6b', borderColor: '#6b6b6b' }}
                    >
                        Confirmar
                    </Button>
                </div>
            </Form>
        );
        if (tipo === 'agregar' || tipo === 'modificar') return (
            <Form
                onSubmit={tipo === 'agregar' ? handleEnvio : handleActualizacion}
                key={claveFormulario}
                noValidate
                validated={validacion}
            >
                <FormularioPersonal
                    data={datosFormularioPersonal}
                    handleChange={handleChange}
                    isModifying={tipo === 'modificar'}
                    validacion={setValidacion}
                />
            </Form>
        );
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
                                onChange={(e) => setFiltroAnio(e.target.value)}
                                className="mb-2"
                            />
                            <div className="lista-planificaciones border rounded" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                {filtradas.map(p => (
                                    <div key={p.id} className={`item-planificacion ${planificacionSeleccionadaId === p.id ? 'seleccionada' : ''}`}
                                        onClick={() => { setPlanificacionSeleccionadaId(p.id); cargarPersonalOrigen(p.id); }}
                                        style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #eee', backgroundColor: planificacionSeleccionadaId === p.id ? '#f27024' : '', color: planificacionSeleccionadaId === p.id ? 'white' : '#000' }}>
                                        <span>Planificación {p.anio}</span>
                                    </div>
                                ))}
                            </div>
                        </Col>
                        <Col md={7}>
                            <div className="box-proyectos-check p-3 border rounded bg-light" style={{ maxHeight: '335px', overflowY: 'auto', minHeight: '335px' }}>
                                {personalOrigen.length > 0 ? personalOrigen.map(p => {
                                    const yaExistePersona = listaPersonal.some(existente => existente.numeroDocumento === p.numeroDocumento);
                                    return (

                                        <Form.Check
                                            key={p.id}
                                            type="checkbox"
                                            label={
                                                <div style={{ color: yaExistePersona ? '#9e9e9e' : '#000' }}>
                                                    <strong>{p.apellido}, {p.nombre}</strong>
                                                    {yaExistePersona && <span className="ms-2 badge bg-secondary">Ya vinculado</span>}
                                                    <br />
                                                    <small className="text-muted">{capitalizar(p.objectType)}</small>
                                                </div>}
                                            checked={seleccionadosParaClonar.includes(p.id)}
                                            onChange={() => setSeleccionadosParaClonar(prev => prev.includes(p.id) ? prev.filter(idExistente => idExistente !== p.id) : [...prev, p.id])}
                                            className="mb-2"
                                        />
                                    )
                                }) : <p className="text-center text-muted mt-5">Selecciona una planificación para poder importar datos.</p>}
                            </div>
                        </Col>
                    </Row>
                    <div className="d-flex justify-content-between mt-4 pt-3 border-top">
                        <small className="text-muted">{seleccionadosParaClonar.length} seleccionados</small>
                        <div className="gap-2 d-flex">
                            <Button
                                variant="danger" onClick={() => setMostrarModal(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={confirmarImportacion}
                                disabled={seleccionadosParaClonar.length === 0}
                                style={{ backgroundColor: '#6b6b6b', borderColor: '#6b6b6b', color: 'white' }}
                            >
                                Importar
                            </Button>
                        </div>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="personal-layout">
            <div className="personal-contenido">
                <div className="personal mt-3 text-center">
                    <h1 className="mb-1 titulo-personal">Personal</h1>
                    {grupo && <h3 className="subtitulo-grupo"> Grupo {grupo.sigla} - Planificación {planificacionActual.anio}</h3>}
                </div>
                <div className="filtros-container mb-4 p-3 shadow-sm rounded bg-light border">
                    <div className="d-flex justify-content-between gap-2 mb-3 pb-3 border-bottom">

                        <Button
                            variant={vistaConsulta ? "primary" : "outline-primary"}
                            onClick={() => setVistaConsulta(!vistaConsulta)}
                            style={{ 'background-color': '#6b6b6b', 'border-color': '#6b6b6b', 'color': 'white' }}
                        >
                            {vistaConsulta ? "Ir a Gestión de Personal" : "Ir a Consulta de Datos Personales"}
                        </Button>

                        <div className="d-flex gap-2">
                            <PermisoAccion permisoRequerido="editar">
                                <BotonAgregar
                                    accion={abrirModalImportar}
                                    disabled={estaBloqueado}
                                    className="btn-outline-secondary"
                                >
                                    Traer Personal
                                </BotonAgregar>
                            </PermisoAccion>

                            <PermisoAccion permisoRequerido="editar">
                                <BotonAgregar
                                    accion={abrirModalAgregar}
                                    disabled={estaBloqueado}>
                                    <img src={imagenMas} alt="mas" className="me-2" style={{ width: '12px' }} />
                                    Nuevo Personal
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
                                    <option value="activos">Activos</option>
                                    <option value="inactivos">Inactivos</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                        <Col lg={4} md={6}>
                            <FloatingLabel label="Ordenar">
                                <Form.Select
                                    value={ordenAlfabetico}
                                    onChange={(e) => setOrdenAlfabetico(e.target.value)}
                                >
                                    <option value="ninguno">Sin orden específico</option>
                                    <option value="az">Ordenar de A a Z</option>
                                    <option value="za">Ordenar de Z a A</option>
                                </Form.Select>
                            </FloatingLabel>
                        </Col>
                    </Row>
                </div>

                {!vistaConsulta && (
                    <div className="tipo-container">
                        <div className="btn-tipo-container">
                            {["TODOS", "BECARIO", "INVESTIGADOR", "PROFESIONAL", "SOPORTE", "VISITANTE"].map((tipo) => (
                                <Button
                                    key={tipo}
                                    variant="light"
                                    className={`btn-filtro-tipo ${filtroTipoPersonal === tipo ? 'active' : ''}`}
                                    onClick={() => { setFiltroTipoPersonal(tipo); setPaginaActual(1); }}
                                    size="sm"
                                >
                                    {capitalizar(tipo)}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="tabla-wrapper">
                    <div className="tabla-container">
                        <Tabla
                            columnas={vistaConsulta ? columnasConsulta : columnasGestion}
                            filas={vistaConsulta ? filasConsulta : filasGestion}
                        />
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev onClick={() => setPaginaActual(p => p - 1)} disabled={paginaActual === 1} />
                                {[...Array(totalPaginas)].map((_, i) => (<Pagination.Item key={i + 1} active={i + 1 === paginaActual} onClick={() => setPaginaActual(i + 1)}>{i + 1}</Pagination.Item>))}
                                <Pagination.Next onClick={() => setPaginaActual(p => p + 1)} disabled={paginaActual === totalPaginas} />
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>
            <div className="personal-footer">
                <BotonAgregar
                    accion={() => navegar("/grupo")}
                >
                    <img src={imagenVolver} style={{ width: '15px' }} />
                    Volver a grupos
                </BotonAgregar>
            </div>

            <ModalFormularios
                show={mostrarModal}
                onHide={() => setMostrarModal(false)}
                titulo={infoModal.titulo}
                contentClassName="modal-planif-boceto"
            >
                {renderizarContenidoModal()}
            </ModalFormularios>

            <ModalFormularios
                show={confirmacionModal.show}
                onHide={() => setConfirmacionModal(prev => ({ ...prev, show: false }))}
                titulo={confirmacionModal.titulo}
                className="modal-confirmacion"
            >
                <div className="text-center p-3">
                    <p>{confirmacionModal.mensaje}</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Boton
                            texto="Cancelar"
                            accion={() => setConfirmacionModal(prev => ({ ...prev, show: false }))}
                        />
                        <Boton
                            texto="Confirmar"
                            accion={() => { confirmacionModal.onConfirm(); setConfirmacionModal(prev => ({ ...prev, show: false })); }}
                        />
                    </div>
                </div>
            </ModalFormularios>
        </div>
    );
}

export default Personal;