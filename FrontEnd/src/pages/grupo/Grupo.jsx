//1. IMPORTACIONES

//react
import React, { useEffect, useState, useMemo } from "react";
import { Form, Pagination, Button } from 'react-bootstrap';
import { sileo } from "sileo";

// componentes
import Tabla from "../../components/Tabla";
import Boton from "../../components/Boton";
import BotonAgregar from "../../components/BotonAgregar";
import ModalFormularios from "../../components/ModalFormularios";
import FormularioGrupo from "./FormularioGrupo"; 
import Planificacion from "../planificacion/Planificacion";

//para los permisos de usuario
import { usoDePermisos } from "../../hooks/usoDePermisos";
import { PermisoAccion } from "../../components/seguridad/PermisoAccion";

//estilos
import "./Grupo.css";
import imagenMas from "../../images/mas.png";
import imagenModificar from "../../images/modificar.png";
import imagenVincular from "../../images/vincular.png"
import imagenDesvincular from "../../images/desvincular.png"
import imagenEliminar from "../../images/eliminar.png";

//services
import { getGrupos, getGrupo, createGrupo, updateGrupo, deleteGrupo } from "../../services/GrupoService";
import { getInstituciones } from "../../services/InstitucionService";

function Grupo() {

    //2. ESTADOS
    //estados de interfaz (ui) y modales
    const [mostrarModal, setMostrarModal] = useState(false); 
    const [MostrarModalInstitucion, setMostrarModalInstitucion] = useState(false);
    const [mostrarModalPlanificacion, setMostrarModalPlanificacion] = useState(false);
    const [infoModal, setInfoModal] = useState({ titulo: '', tipo: null });
    const [claveFormulario, setClaveFormulario] = useState(0); 
    const [validacion, setValidacion] = useState(false);
    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [confirmacionModal, setConfirmacionModal] = useState({ 
        show: false, 
        titulo: '', 
        mensaje: '', 
        onConfirm: null 
    });

    //estados de paginacion y filtros
    const [paginaActual, setPaginaActual] = useState(1); 
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [busqueda, setBusqueda] = useState("");
    const [filtroEstado, setFiltroEstado] = useState("todos"); 
    const [ordenAlfabetico, setOrdenAlfabetico] = useState("ninguno"); 

    //estados de datos (listado y seleccion)
    const [grupos, setGrupos] = useState([]);
    const [instituciones, setInstituciones] = useState([]);
    const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState(null);
    const [idGrupoAModificar, setIdGrupoAModificar] = useState(null);

    //estados de formulario y detalles
    const [datosNuevoGrupo, setDatosNuevoGrupo] = useState({ 
        sigla: '', 
        nombre: '', 
        institucionId: '', 
        director: '', 
        vicedirector: '', 
        correo_electronico: '', 
        objetivos: '', 
        organigrama: '', 
        consejo_ejecutivo: '', 
        activo: true
    });

    const [datosFormularioGrupo, setDatosFormularioGrupo] = useState({ 
        sigla: '', 
        nombre: '', 
        institucion: '', 
        director: '', 
        vicedirector: '', 
        correo_electronico: '', 
        objetivos: '', 
        organigrama: '', 
        consejo_ejecutivo: '', 
        activo: '' 
    });

    const [contenidoDetalle, setContenidoDetalle] = useState({ 
        campo: null, contenido: '', grupoId: null 
    });

    // para la columna dinamica segun permisos
    const { puedeEditar, puedeEliminar } = usoDePermisos();

    const columnas = useMemo(() => {
        const columnasBase = [
            "Selección", 
            "Sigla", 
            "Nombre",
            "Unidad Académica", 
            "Director/a", 
            "Vicedirector/a", 
            "Correo Electrónico"
        ];

        // Si el usuario puede editar, tiene columna de Acciones
        if (puedeEditar || puedeEliminar) {
            columnasBase.push("Acciones");
        }

        return columnasBase;
    }, [puedeEditar]);


    //3. EFECTOS (Carga de datos) 
    useEffect(() => { obtenerInstituciones(); }, []);
    useEffect(() => { obtenerGrupos(); }, [paginaActual, busqueda, filtroEstado, ordenAlfabetico]);


    // --- 4. FUNCIONES DE API (Llamadas al servidor) ---
    const obtenerGrupos = async () => {
        try {
            let direccion = "asc";
            let columna = "id";

            if(ordenAlfabetico === "az") { 
                direccion = "asc"; 
                columna = "nombre"; 
            } 
            else if (ordenAlfabetico === "za"){ 
                direccion = "desc"; 
                columna = "nombre"; 
            }

            const filtrosGrupo = {
                busqueda: busqueda,
                activo: filtroEstado === "activos" ? "true" : (filtroEstado === "inactivos" ? "false" : "todos")
            }

            const data = await getGrupos(paginaActual, 5, filtrosGrupo, columna, direccion);
            setGrupos(data.datos || []);
            setTotalPaginas(data.metadatos?.total_paginas || 1);
        } catch (error) {
            sileo.error({ title: "Error", description: "Error al obtener los grupos" }); 
        }
    };

    const obtenerInstituciones = async () => {
        try {
            const data = await getInstituciones(null, null);
            setInstituciones(data.datos || []); 
        } catch (error) { console.error("Error instituciones:", error); }
    };


    // 5. HANDLERS DE FORMULARIO (Crear y Modificar)
    const handleEnvio = async (event) => {
        const formulario = event.currentTarget;
        if (formulario.checkValidity() === false) {
            event.preventDefault();
            event.stopPropagation();
            setValidacion(true);
            return;
        }
        event.preventDefault();

        sileo.promise(
            (async () => {
                await createGrupo({ ...datosNuevoGrupo, consejo_ejecutivo: datosNuevoGrupo.consejo_ejecutivo || '' });
                await obtenerGrupos();
                setMostrarModal(false);
                setValidacion(false);
            })(), 
            {
                loading: { title: "Creando grupo..." },
                success: { title: "¡Éxito!", description: "El grupo ha sido creado correctamente" },
                error: { title: "Error", description: "No se pudo crear el grupo" }
            }
        );
    };

    const handleActualizacion = async (event) => { 
        
        event.preventDefault();
        if (!idGrupoAModificar) return;

        sileo.promise(
            (async () => {
                await updateGrupo(idGrupoAModificar, datosFormularioGrupo);
                await obtenerGrupos(); 
                setMostrarModal(false); 
            })(),
            {
                loading: { title: "Actualizando..." },
                success: { title: "¡Éxito!", description: "Grupo actualizado correctamente" },
                error: { title: "Error", description: "No se pudo actualizar el grupo" }
            }
        );
    };

    //6. HANDLERS DE ACCIONES (Desvincular, Modificar, Ver Detalle)
    const handleDesvincular = async (idGrupo) => {

        if (idGrupo !== grupoSeleccionadoId) {
        return sileo.warning({ 
            title: "Selección requerida", 
            description: "Debe seleccionar el grupo antes de querer darlo de baja." 
        });
    }
        const grupo = await getGrupo(idGrupo);
        setConfirmacionModal({
            show: true,
            titulo: `Confirmar Baja del Grupo ${grupo.sigla}`,
            mensaje: `¿Estás seguro de que deseas dar de baja al grupo ${grupo.sigla}?`,
            onConfirm: () => {
                sileo.promise(
                    (async () => {
                        await updateGrupo(idGrupo, { ...grupo, activo: false });
                        await obtenerGrupos();
                    })(),
                    {
                        loading: { title: "Dando de Baja..." },
                        success: { title: "Éxito", description: `Grupo ${grupo.sigla} dado de baja exitosamente` },
                        error: { title: "Error", description: "No se pudo dar de baja" }
                    }
                );
            }
        });
    };

    const handleRevincular = async (idGrupo) => {
        
        if (idGrupo !== grupoSeleccionadoId) {
        return sileo.warning({ 
            title: "Selección requerida", 
            description: "Debe seleccionar el grupo antes de dar de alta." 
        });
    }
        const grupo = await getGrupo(idGrupo);
        setConfirmacionModal({
            show: true,
            titulo: `Confirmar Alta del Grupo ${grupo.sigla}`,
            mensaje: `¿Estás seguro de que deseas dar de alta al grupo ${grupo.sigla}?`,
            onConfirm: () => {
                sileo.promise(
                    (async () => {
                        await updateGrupo(idGrupo, { ...grupo, activo: true });
                        await obtenerGrupos();
                    })(),
                    {
                        loading: { title: "Desvinculando..." },
                        success: { title: "Éxito", description: `Grupo ${grupo.sigla} dado de alta nuevamente` },
                        error: { title: "Error", description: "No se pudo dar de alta" }
                    }
                );
            }
        });
    };

    const iniciarModificacion = async (id) => {
        if (id !== grupoSeleccionadoId) {
        return sileo.warning({ 
            title: "Selección requerida", 
            description: "Debe seleccionar el grupo antes de modificar." 
        });
    }
        try {
            const grupo = await getGrupo(id);
            setIdGrupoAModificar(id); 
            setDatosFormularioGrupo({ ...grupo });
            setInfoModal({ titulo: `Modificar Grupo: ${grupo.nombre}`, tipo: 'modificar' });
            setMostrarModal(true);
        } catch (error) { 
            sileo.error({ title: "Error", description: error.message });
        }
    };

    const obtenerYAbrirModalDetalle = (campoUI, tituloModal) => { 
        if (!grupoSeleccionadoId) return (
            sileo.warning({ title: "Advertencia", description: "Debe seleccionar un grupo primero" })
        ); 
        const mapping = { objetivo: 'objetivos', consejoEjecutivo: 'consejo_ejecutivo', organigrama: 'organigrama' };
        const grupo = grupos.find(g => g.id === grupoSeleccionadoId);
        setContenidoDetalle({ campo: mapping[campoUI], contenido: grupo[mapping[campoUI]] || "", grupoId: grupoSeleccionadoId });
        setInfoModal({ titulo: tituloModal, tipo: 'verDetalle' });
        setMostrarModal(true);
    };


    // --- 7. AUXILIARES DE UI Y FILTRADO ---
    const gruposFiltradosYOrdenados = useMemo(() => { return [...grupos] }, [grupos]);
    const handleCambioRadio = (id) => setGrupoSeleccionadoId(id);
    const paginar = (n) => { setPaginaActual(n); setGrupoSeleccionadoId(null); };

    const handleFormularioNuevo = (event) => { 
        const { name, value } = event.target; 
        setDatosNuevoGrupo(prev => ({ ...prev, [name]: value }));
    };

    const handleCambioFormulario = (event) => { 
        const { name, value } = event.target;
        setDatosFormularioGrupo(prev => ({ ...prev, [name]: value }));
    };

    const agregarGrupo = () => {
        setDatosNuevoGrupo({ 
            sigla: '', 
            nombre: '', 
            institucion: '', 
            director: '', 
            vicedirector: '', 
            correo_electronico: '', 
            objetivos: '', 
            organigrama: '', 
            consejo_ejecutivo: '', 
            activo: true 
        });
        setValidacion(false);
        setClaveFormulario(prev => prev + 1);
        setInfoModal({ titulo: "Agregar Grupo", tipo: 'agregar' });
        setMostrarModal(true);
    };

    const handleEliminar = async (id) => {
        if (id !== grupoSeleccionadoId) {
            return sileo.warning({ 
                title: "Selección requerida", 
                description: "Debe seleccionar el grupo antes de eliminar." 
            });
        }

        try {
            const grupo = await getGrupo(id); 
            
            setConfirmacionModal({
                show: true,
                titulo: 'Eliminar Grupo',
                mensaje: `¿Estás seguro de eliminar permanentemente el grupo "${grupo.nombre}"? Esta acción es irreversible y solo es posible si no tiene planificaciones.`,
                onConfirm: () => ejecutarEliminacion(id)
            });
        } catch (error) {
            sileo.error({ title: "Error", description: "No se pudo obtener la información del grupo." });
        }
    };

    const ejecutarEliminacion = async (id) => {
        setConfirmacionModal(prev => ({ ...prev, show: false }));

        sileo.promise((async () => {
            await deleteGrupo(id);
            
            if (grupos.length === 1 && paginaActual > 1) {
                setPaginaActual(prev => prev - 1);
            } else {
                await obtenerGrupos();
            }
            
            setGrupoSeleccionadoId(null);
        })(), {
            loading: { title: "Eliminando grupo..." },
            success: { title: "Grupo eliminado con éxito" },
            error: { 
                title: "No se pudo eliminar",
                description: (err) => err.response?.data?.mensaje || "El grupo tiene planificaciones asociadas." 
            }
        });
    };


    // CONSTRUCCIÓN DE FILAS Y CONTENIDO MODAL
    const filasTabla = gruposFiltradosYOrdenados.map(item => {
        
        const grupoSeleccionado = grupoSeleccionadoId === item.id;
        const esInactivo = item.activo === false;
        const estiloFila = esInactivo ? { color: '#9e9e9e', fontStyle: 'italic' } : {};

        const seleccion = (
            <Form.Check 
                type="radio" 
                name="grupoSelection" 
                checked={grupoSeleccionadoId === item.id} 
                onChange={() => handleCambioRadio(item.id)} 
            />
        )

        let celdaAcciones = null;

        if (puedeEditar) {
            const botonModificar = (
                <PermisoAccion permisoRequerido="editar">
                    <BotonAgregar accion={() => iniciarModificacion(item.id)}>
                        <img src={imagenModificar} alt="edit" style={{width: '15px'}} />
                    </BotonAgregar>
                </PermisoAccion>
            )

            const botonDesvincular = (
                <PermisoAccion permisoRequerido="editar">
                    <BotonAgregar 
                        accion={esInactivo 
                            ? () => handleRevincular(item.id)
                            : () => handleDesvincular(item.id)
                        }
                    >
                        <img 
                            src={esInactivo ? imagenVincular : imagenDesvincular} 
                            alt={esInactivo ? "vincular" : "desvincular"} 
                            style={{width: '15px'}}
                        />
                    </BotonAgregar>
                </PermisoAccion>
            )

            const botonEliminar = (
                <PermisoAccion permisoRequerido="eliminar">
                    <BotonAgregar accion={() => handleEliminar(item.id)}>
                        <img src={imagenEliminar} alt="eliminar" style={{width: '15px'}} />
                    </BotonAgregar>
                </PermisoAccion>
            );

            celdaAcciones = (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '3px', marginLeft:'20px'}}>
                    {botonModificar}
                    {botonDesvincular}
                    {botonEliminar}
                </div>
            );
        }

        const fila = [
            seleccion,
            <span style={estiloFila}>{item.sigla}</span>,
            <span style={estiloFila}>{item.nombre}</span>,
            <span style={estiloFila}>{item.institucionNombre}</span>,
            <span style={estiloFila}>{item.director}</span>,
            <span style={estiloFila}>{item.vicedirector}</span>,
            <span style={estiloFila}>{item.correo_electronico}</span>
        ];   

        if (celdaAcciones) {
            fila.push(celdaAcciones);
        }

        return fila;
    });

    const renderizarContenidoModal = () => {
        const { tipo } = infoModal;
        if (tipo === 'agregar' || tipo === 'modificar') {
            return (
                <Form onSubmit={tipo === 'agregar' ? handleEnvio : handleActualizacion} key={claveFormulario} noValidate validated={validacion}> 
                    <FormularioGrupo 
                        data={tipo === 'agregar' ? datosNuevoGrupo : datosFormularioGrupo} 
                        handleChange={tipo === 'agregar' ? handleFormularioNuevo : handleCambioFormulario}
                        isModifying={tipo === 'modificar'} instituciones={instituciones} validacion={validacion}
                        onAbrirNuevoModalInstitucion={() => setMostrarModalInstitucion(true)}
                    />
                </Form>
            );
        }
        if (tipo === 'verDetalle') {
            return (
                <div className="detalle-texto-container">
                    <p 
                        style={{ 
                            whiteSpace: 'pre-wrap', 
                            padding: '10px', 
                            border: '1px solid #ccc', 
                            backgroundColor: '#f8f9fa' 
                        }}>{contenidoDetalle.contenido || "Vacío."}
                    </p>
                </div>
            )
        }
        return null;
    };

    //9. RENDER FINAL
    return (
        <div className="grupo-layout">
            <div className="grupo-contenido">
                <div className="row grupo mt-3">
                    <h1 className="mb-1 titulo-grupo text-center">Grupos</h1>
                </div>

                <div className="filtros-container">
                    <div className="row align-items-center g-2">
                        <div className="col-lg-4 col-md-12">
                            <Form.Control type="text" placeholder="Buscar por nombre..." value={busqueda} onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }} />
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <Form.Select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}>
                                <option value="todos">Todos los estados</option>
                                <option value="activos">Solo Activos</option>
                                <option value="inactivos">Solo Inactivos</option>
                            </Form.Select>
                        </div>
                        <div className="col-lg-3 col-md-6">
                            <Form.Select value={ordenAlfabetico} onChange={(e) => setOrdenAlfabetico(e.target.value)}>
                                <option value="ninguno">Sin orden específico</option>
                                <option value="az">Ordenar de A a Z</option>
                                <option value="za">Ordenar de Z a A</option>
                            </Form.Select>
                        </div>
                        <div className="col-lg-2 d-flex justify-content-lg-end justify-content-start">
                            <PermisoAccion permisoRequerido="editar">
                                <BotonAgregar accion={agregarGrupo}>
                                    <img className="me-2" src={imagenMas} alt="mas" style={{ width: '13px' }} />
                                    Agregar Grupo
                                </BotonAgregar>
                            </PermisoAccion>
                        </div>
                    </div>
                </div>

                <div className="tabla-wrapper">
                    <div className="tabla-container">
                        <Tabla columnas={columnas} filas={filasTabla} />
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
                                        onClick={() => paginar(i+1)}>{i+1}
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

            <div className="grupo-footer">
                <Boton 
                    texto="Ver Planificacion" 
                    accion={() => !grupoSeleccionadoId ? sileo.warning({title: "Advertencia", description: "Seleccione un grupo primero"}) : setMostrarModalPlanificacion(true)} 
                />
                <Boton 
                    texto="Ver Objetivos" 
                    accion={() => obtenerYAbrirModalDetalle('objetivo', 'Objetivos')} 
                />
                <Boton 
                    texto="Ver Organigrama" 
                    accion={() => obtenerYAbrirModalDetalle('organigrama', 'Organigrama')} 
                />
                <Boton 
                    texto="Ver Consejo" 
                    accion={() => obtenerYAbrirModalDetalle('consejoEjecutivo', 'Consejo Ejecutivo')}
                />
            </div>

            <ModalFormularios 
                show={mostrarModal} 
                onHide={() => setMostrarModal(false)} 
                titulo={infoModal.titulo}
            >
                {renderizarContenidoModal()}
            </ModalFormularios>

            <ModalFormularios 
                show={confirmacionModal.show} 
                onHide={() => setConfirmacionModal(prev => ({ ...prev, show: false }))} 
                titulo={confirmacionModal.titulo}
            >
                <div className="text-center p-3">
                    <p>{confirmacionModal.mensaje}</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Button 
                            variant="danger" 
                            onClick={() => setConfirmacionModal(prev => ({ ...prev, show: false }))}
                        >
                            Cancelar
                        </Button>
                        <Boton 
                            texto="Confirmar" 
                            accion={() => confirmacionModal.onConfirm()} 
                        />
                    </div>
                </div>
            </ModalFormularios>
            <Planificacion 
                show={mostrarModalPlanificacion} 
                onHide={() => setMostrarModalPlanificacion(false)} 
                idGrupo={grupoSeleccionadoId} 
                sigla={grupos.find(g => g.id === grupoSeleccionadoId)?.sigla}
                grupoActivo={grupos.find(g => g.id === grupoSeleccionadoId)?.activo}
            />
        </div>
    );
}

export default Grupo;