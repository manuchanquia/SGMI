import React, { useEffect, useState } from "react";
import { Modal, Form } from 'react-bootstrap';
import { useNavigate } from "react-router-dom"; 
import { sileo } from "sileo";

import Boton from "../../components/Boton";
import BotonAgregar from "../../components/BotonAgregar";
import ModalFormularios from "../../components/ModalFormularios";
// PARA LOS PERMISOS DE USUARIO
import { usoDePermisos } from "../../hooks/usoDePermisos";
import { PermisoAccion } from "../../components/seguridad/PermisoAccion";

import "./Planificacion.css";
import imagenMas from "../../images/mas.png";
import imagenExportar from "../../images/exportar.png"; 
import imagenCongelar from "../../images/congelar.png";

import { getPlanificaciones, createPlanificacion, updatePlanificacion } from "../../services/PlanificacionService";
import { excelService } from "../../services/ExcelService";

function Planificacion({ show, onHide, idGrupo, sigla, grupoActivo }) {

    const navegar = useNavigate();
    const grupoEstaActivo = grupoActivo === true;

    const [planificaciones, setPlanificaciones] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState('');
    const [seleccionados, setSeleccionados] = useState([]);
    const [nuevaPlanificacionVisible, setNuevaPlanificacionVisible] = useState(false);
    const [modoEdicion, setModoEdicion] = useState(false);
    const [accionPendiente, setAccionPendiente] = useState(null);

    const hayPlanificacionesActivas = planificaciones.some(p => p.activa === true);

    const [confirmacionModal, setConfirmacionModal] = useState({ 
        show: false, titulo: '', mensaje: '', onConfirm: null 
    });

    useEffect(() => {
        if (show && idGrupo) {
            obtenerPlanificaciones();
            resetEstados();
        }
    }, [show, idGrupo]);

    const resetEstados = () => {
        setModoEdicion(false);
        setSeleccionados([]);
        setAccionPendiente(null);
        setAnioSeleccionado('');
        setNuevaPlanificacionVisible(false);
    };

    const obtenerPlanificaciones = async () => {
        try {
            const data = await getPlanificaciones(idGrupo);
            const lista = Array.isArray(data) ? data : (data.datos || []);
            setPlanificaciones(lista.sort((a, b) => b.anio - a.anio));
        } catch (error) {
            console.error("Error al obtener planificaciones:", error);
        }
    };

    const generarOpcionesAnios = () => {
        const anioActual = new Date().getFullYear();
        const aniosUsados = new Set(planificaciones.map(p => p.anio));
        const anios = [];

        for (let i = anioActual + 2; i >= anioActual - 10; i--) {
            anios.push({
                valor: i,
                deshabilitado: aniosUsados.has(i)
            });
        }
        return anios;
    };

    const handleCrear = async () => {
        if (!anioSeleccionado || !grupoEstaActivo) return;

        sileo.promise(
            (async () => {
                await createPlanificacion(idGrupo, anioSeleccionado);
                setAnioSeleccionado('');
                setNuevaPlanificacionVisible(false);
                await obtenerPlanificaciones();
            })(),
            {
                loading: { title: "Creando planificación..." },
                success: { title: "¡Éxito!", description: "Planificación creada correctamente" },
                error: { title: "Error", description: "No se pudo crear la planificación" }
            }
        );
    };

    const activarModoEdicion = (accion) => {
        if (!grupoEstaActivo && accion === 'congelar') return;
        setModoEdicion(true);
        setAccionPendiente(accion);
        setSeleccionados([]);
    };

    const handleConfirmarAccion = () => {
        if (seleccionados.length === 0) {
            return sileo.warning({
                title: "Atención",
                description: "Selecciona al menos una planificación"
            });
        }

        if (accionPendiente === 'exportar') {
            handleExportar();
        } else if (accionPendiente === 'congelar') {
            setConfirmacionModal({
                show: true,
                titulo: "Congelar planificaciones",
                mensaje: "¿Estás seguro de congelar la/s planificación/es seleccionada/s? Esta accion es irreversible",
                onConfirm: () => handleCongelarPlanificaciones()
            });
        }
    };

    const handleCongelarPlanificaciones = async () => {
        const proceso = async () => {
            for (const id of seleccionados) {
                const p = planificaciones.find(item => item.id === id);
                await updatePlanificacion(id, { ...p, activa: false });
            }
        };

        sileo.promise(proceso(), {
            loading: { title: "Congelando..." },
            success: {
                title: "¡Éxito!",
                description: "Planificaciones congeladas correctamente"},
            error: { title: "Error al congelar" }
        });
        await obtenerPlanificaciones();
        resetEstados();
    };

    const handleExportar = async () => {
        const fetchExport = async () => {
            for (const id of seleccionados) {
                const p = planificaciones.find(item => item.id === id);
                await excelService.descargarMemoria(id, p.anio);
            }
        };

        sileo.promise(fetchExport(), {
            loading: { title: "Exportando..." },
            success: { title: "¡Excel descargado!"},
            error: { title: "Error en descarga" }
        });
        await obtenerPlanificaciones()
        resetEstados()
    };

    const toggleSeleccion = (id) => {
        setSeleccionados(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    return (
        <>
            <Modal 
                show={show} 
                onHide={onHide} 
                centered 
                contentClassName={`modal-planif-boceto ${confirmacionModal.show ? 'modal-en-profundidad' : ''}`}
            >
                <Modal.Body className="p-4">

                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h1 className="modal-titulo-dibujo">Planificaciones</h1>

                        <div className="d-flex gap-2">
                            {!modoEdicion && (
                                <PermisoAccion permisoRequerido="editar">
                                    <BotonAgregar 
                                        className={`btn-dibujo-naranja ${!grupoEstaActivo ? 'deshabilitado-visual' : ''}`}
                                        accion={() => grupoEstaActivo && setNuevaPlanificacionVisible(!nuevaPlanificacionVisible)}
                                        style={{
                                            opacity: !grupoEstaActivo ? 0.4 : 1,
                                            cursor: !grupoEstaActivo ? 'not-allowed' : 'pointer',
                                            filter: !grupoEstaActivo ? 'grayscale(1)' : 'none'
                                        }}
                                        title={!grupoEstaActivo ? "El grupo está desactivado" : "Agregar planificación"}
                                    >
                                        <img src={imagenMas} alt="agregar" style={{width: '15px'}}/>
                                    </BotonAgregar>
                                </PermisoAccion>
                            )}

                            <BotonAgregar
                                className={`btn-dibujo-naranja ${accionPendiente === 'exportar' ? 'active' : ''}`}
                                accion={() => activarModoEdicion('exportar')}
                            >
                                <img src={imagenExportar} alt="exportar" style={{ width: '15px' }} />
                            </BotonAgregar>

                            <PermisoAccion permisoRequerido="editar">
                                <BotonAgregar 
                                    className={`btn-dibujo-naranja ${accionPendiente === 'congelar' ? 'active' : ''}`}
                                    accion={() => (hayPlanificacionesActivas && grupoEstaActivo) && activarModoEdicion('congelar')}
                                    style={{
                                        opacity: (!hayPlanificacionesActivas || !grupoEstaActivo) ? 0.4 : 1,
                                        cursor: (!hayPlanificacionesActivas || !grupoEstaActivo) ? 'not-allowed' : 'pointer',
                                        filter: (!hayPlanificacionesActivas || !grupoEstaActivo) ? 'grayscale(1)' : 'none'
                                    }}
                                    title={
                                        !grupoEstaActivo
                                            ? "El grupo está desactivado"
                                            : !hayPlanificacionesActivas
                                                ? "No hay planificaciones activas para congelar"
                                                : "Congelar planificaciones"
                                    }
                                >
                                    <img src={imagenCongelar} alt="desvincular" style={{width: '15px'}}/>
                                </BotonAgregar>
                            </PermisoAccion>
                        </div>
                    </div>

                    <p className="sigla-grupo-detalle mb-0 d-flex align-items-center gap-2">
                        <span>Grupo {sigla || idGrupo}</span>
                        {!grupoEstaActivo && (
                            <span className="badge bg-danger">Desactivado</span>
                        )}
                    </p>

                    <hr className="linea-negra mt-2" />

                    {nuevaPlanificacionVisible && !modoEdicion && grupoEstaActivo && (
                        <div className="d-flex gap-2 mb-3 animate__animated animate__fadeIn">
                            <Form.Select
                                size="sm"
                                value={anioSeleccionado}
                                onChange={e => setAnioSeleccionado(e.target.value)}
                            >
                                <option value="">Seleccione un año</option>
                                {generarOpcionesAnios().map(op => (
                                    <option
                                        key={op.valor}
                                        value={op.valor}
                                        disabled={op.deshabilitado}
                                        style={{ color: op.deshabilitado ? '#b0b0b0' : 'black' }}
                                    >
                                        {op.valor} {op.deshabilitado ? "(Ya existe)" : ""}
                                    </option>
                                ))}
                            </Form.Select>
                            <Boton texto="Agregar" accion={handleCrear} />
                        </div>
                    )}

                    <div className="modal-lista-scroll">
                        {planificaciones.map(p => {
                            const estaCongelada = p.activa === false;
                            return (
                                <div
                                    key={p.id}
                                    className={`item-planif-dibujo d-flex align-items-center ${estaCongelada ? 'congelada' : ''}`}
                                >
                                    {modoEdicion && (
                                        <Form.Check
                                            type="checkbox"
                                            id={`p-${p.id}`}
                                            checked={seleccionados.includes(p.id)}
                                            onChange={() => toggleSeleccion(p.id)}
                                            disabled={estaCongelada && accionPendiente === 'congelar'}
                                        />
                                    )}

                                    <span
                                        className={`ms-3 mb-0 flex-grow-1 
                                            ${!modoEdicion && !estaCongelada ? 'link-planificacion' : ''} 
                                            ${estaCongelada ? 'texto-congelado' : ''}`}
                                        onClick={() => !modoEdicion && navegar(`/proyectos/planificacion/${p.id}`)}
                                    >
                                        Planificación {p.anio}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {modoEdicion && (
                        <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                            <Boton texto="Cancelar" accion={resetEstados} />
                            <Boton
                                texto={accionPendiente === 'exportar' ? "Exportar" : "Congelar"}
                                accion={handleConfirmarAccion}
                            />
                        </div>
                    )}

                </Modal.Body>
            </Modal>

            <ModalFormularios
                show={confirmacionModal.show}
                onHide={() => setConfirmacionModal(prev => ({ ...prev, show: false }))}
                titulo={confirmacionModal.titulo}
                className="modal-confirmacion-wrapper"
                size="sm"
                centered
            >
                <div className="text-center p-3">
                    <p>{confirmacionModal.mensaje}</p>
                    <div className="d-flex justify-content-center gap-3 mt-4">
                        <Boton texto="No" accion={() => setConfirmacionModal(prev => ({ ...prev, show: false }))} />
                        <Boton
                            texto="Sí, confirmar"
                            accion={() => {
                                confirmacionModal.onConfirm();
                                setConfirmacionModal(prev => ({ ...prev, show: false }));
                            }}
                        />
                    </div>
                </div>
            </ModalFormularios>
        </>
    );
}

export default Planificacion;