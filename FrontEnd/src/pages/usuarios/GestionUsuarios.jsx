// --- IMPORTACIONES ---
import React, { useEffect, useState } from "react";
import { Pagination, Form, Modal, Button } from 'react-bootstrap';
import { sileo } from "sileo";

// componentes
import Tabla from "../../components/Tabla";
import FormularioUsuario from "./FormularioUsuario";
import ModalFormularios from "../../components/ModalFormularios";
import BotonAgregar from "../../components/BotonAgregar";

// estilos e iconos
import "./Usuarios.css";
import imagenMas from "../../images/mas.png";
import imagenDesactivar from "../../images/desactivar-usuario.png";
import imagenReactivar from "../../images/reactivar-usuario.png";
import imagenModificar from "../../images/modificar.png";

// services
import { getUsuarios, createUsuario, updateUsuario, getUsuario } from "../../services/UsuarioService";
import { createPersona, updatePersona, getPersona } from "../../services/PersonaService";

function GestionUsuarios() {
    // --- ESTADOS ---
    const [mostrarModal, setMostrarModal] = useState(false);
    const [usuarios, setUsuarios] = useState([]);
    const [paginaActual, setPaginaActual] = useState(1);
    const [totalPaginas, setTotalPaginas] = useState(1);
    const [usuarioSeleccionadoId, setUsuarioSeleccionadoId] = useState(null);
    
    const [validacion, setValidacion] = useState(false);
    const [claveFormulario, setClaveFormulario] = useState(0);
    const [idUsuarioModificar, setIdUsuarioModificar] = useState(null);

    const [busqueda, setBusqueda] = useState("");  
    const [ordenAlfabetico, setOrdenAlfabetico] = useState("ninguno"); 
    const [filtroEstado, setFiltroEstado] = useState("todos");

    const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
    const [configConfirmar, setConfigConfirmar] = useState({ titulo: '', mensaje: '', accion: null });

    const [infoModal, setInfoModal] = useState({ titulo: '', tipo: null });
    const [datosFormulario, setDatosFormulario] = useState({
        email: '', 
        rol: '', 
        id_persona: '', 
        activo: true, 
        clave: '',
        nombre: '',
        apellido: '',
        tipoDocumento: '',
        numeroDocumento: '',
        nacionalidad: ''
    });

    const columnas = ['Selección', 'Nombre', 'Apellido', 'Correo', 'Rol', 'Estado', 'Acciones'];

    useEffect(() => {
        cargarDatos();
    }, [paginaActual, filtroEstado, ordenAlfabetico, busqueda]);

    const cargarDatos = async () => {
        try {
            let direccion = ordenAlfabetico === "za" ? "desc" : "asc";
            let columna = ordenAlfabetico === "ninguno" ? "id" : "nombre";

            const filtrosUsuario = {
                busqueda: busqueda,
                activo: filtroEstado === "activos" ? "true" : (filtroEstado === "inactivos" ? "false" : "todos")
            };

            const dataUsuarios = await getUsuarios(paginaActual, 5, filtrosUsuario, columna, direccion);
            setUsuarios(dataUsuarios.datos || []);
            setTotalPaginas(dataUsuarios.metadatos?.total_paginas || 1);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        }
    };

    const handleCambioFormulario = (event) => {
        const { name, value } = event.target;
        setDatosFormulario(prev => ({ ...prev, [name]: value }));
    };

    // --- LÓGICA DE ENVÍO (CREACIÓN) ---

    const handleEnvioUsuario = async (event) => {
        event.preventDefault();
        const formulario = event.currentTarget;

        if (formulario.checkValidity() === false) {
            event.stopPropagation();
            setValidacion(true);
            return;
        }

        setValidacion(false)

        sileo.promise((async () => {
            let personaIdFinal = null;

            if(datosFormulario.id_persona) {
                personaIdFinal = datosFormulario.id_persona

            } else if (datosFormulario.numeroDocumento && datosFormulario.nombre) {
                const nuevaPersona = await createPersona({
                    nombre: datosFormulario.nombre,
                    apellido: datosFormulario.apellido,
                    tipoDocumento: datosFormulario.tipoDocumento,
                    numeroDocumento: datosFormulario.numeroDocumento,
                    nacionalidad: datosFormulario.nacionalidad,
                    activo: true
                })
                personaIdFinal = nuevaPersona?.id || nuevaPersona?.persona?.id;
            } 

            await createUsuario({
                email: datosFormulario.email,
                rol: datosFormulario.rol,
                clave: datosFormulario.clave,
                id_persona: personaIdFinal, 
                activo: true
            });

            await cargarDatos();
            setMostrarModal(false);
            setValidacion(false);
        })(), { 
            loading: { title: "Registrando..." }, 
            success: { title: "Éxito", description: "Usuario registrado correctamente" }, 
            error: { title: "Error", description: "Verifique que el email no esté duplicado o que los datos sean correctos" } 
        });
    };

    // --- LÓGICA DE ACTUALIZACIÓN ---
    const handleActualizacionUsuario = async (event) => {
        event.preventDefault();
        const formulario = event.currentTarget;

        if (formulario.checkValidity() === false) {
            event.stopPropagation();
            setValidacion(true);
            return;
        }

        sileo.promise((async () => {
            let personaId = datosFormulario.id_persona;
            if (!personaId && datosFormulario.numeroDocumento) {
                const nuevaPersona = await createPersona({
                    nombre: datosFormulario.nombre,
                    apellido: datosFormulario.apellido,
                    tipoDocumento: datosFormulario.tipoDocumento,
                    numeroDocumento: datosFormulario.numeroDocumento,
                    nacionalidad: datosFormulario.nacionalidad,
                    activo: true
                });
        
            personaId = nuevaPersona?.id || nuevaPersona?.persona?.id;
            } else if (personaId) {
                
                await updatePersona(personaId, {
                    nombre: datosFormulario.nombre,
                    apellido: datosFormulario.apellido,
                    tipoDocumento: datosFormulario.tipoDocumento,
                    numeroDocumento: datosFormulario.numeroDocumento,
                    nacionalidad: datosFormulario.nacionalidad
                });
            }

            await updateUsuario(idUsuarioModificar, {
                email: datosFormulario.email,
                rol: datosFormulario.rol,
                activo: datosFormulario.activo,
                id_persona: personaId 
            });

            await cargarDatos();
            setMostrarModal(false);
            setValidacion(false);
        })(), { 
            loading: { title: "Guardando cambios..." }, 
            success: { title: "¡Usuario actualizado!", description: "Se han guardado los datos correctamente." },
            error: { title: "Error", description: "No se pudo actualizar el usuario." }
        });
    };

    const abrirAgregar = () => {
        setDatosFormulario({ 
            email: '', rol: '', id_persona: '', activo: true, clave: '',
            nombre: '', apellido: '', tipoDocumento: '', numeroDocumento: '', nacionalidad: '' 
        });
        setValidacion(false);
        setIdUsuarioModificar(null);
        setClaveFormulario(prev => prev + 1);
        setInfoModal({ titulo: "Registrar Usuario", tipo: 'agregar' });
        setMostrarModal(true);
    };

    const iniciarModificacion = async (id) => {
        if (id !== usuarioSeleccionadoId) {
            return sileo.warning({ 
                title: "Selección requerida", 
                description: "Debe seleccionar el usuario antes de modificar." 
            });
        }

        const usuario = await getUsuario(id);
        let persona = {};
        try {
            persona = await getPersona(usuario.id_persona);
        } catch (e) {
            console.warn("No se encontró información de persona vinculada");
        }

        setIdUsuarioModificar(id);
        setDatosFormulario({ 
            ...usuario, 
            clave: '',
            nombre: persona?.nombre || '',
            apellido: persona?.apellido || '',
            tipoDocumento: persona?.tipoDocumento || '',
            numeroDocumento: persona?.numeroDocumento || '',
            nacionalidad: persona?.nacionalidad || ''
        });

        const identificador = (persona?.nombre || persona?.apellido) 
            ? `${persona.nombre} ${persona.apellido}` 
            : usuario.email;

        setInfoModal({ 
            titulo: `Modificar Usuario: ${identificador}`, 
            tipo: 'modificar' 
        });
            
        setValidacion(false);
        setMostrarModal(true);
            
    };

    const handleAltaBaja = async (usuario) => {
        if (usuario.id !== usuarioSeleccionadoId) {
            return sileo.warning({ 
                title: "Selección requerida", 
                description: "Debe seleccionar el usuario antes de cambiar su estado." 
            });
        }

        const esBaja = usuario.activo;
        const titulo = esBaja ? 'Confirmar Desactivacion' : 'Confirmar Reactivación';
        const mensaje = esBaja 
            ? `¿Estás seguro de que deseas desactivar al usuario ${usuario.email}?` 
            : `¿Deseas reactivar al usuario ${usuario.email}?`;

        setConfigConfirmar({
            titulo: titulo,
            mensaje: mensaje,
            accion: () => ejecutarCambioEstado(usuario)
        });
        
        setMostrarConfirmar(true);
    };

    const ejecutarCambioEstado = async (usuario) => {
        setMostrarConfirmar(false); 
        
        sileo.promise((async () => {
            await updateUsuario(usuario.id, { ...usuario, activo: !usuario.activo });
            await cargarDatos();
        })(), {
            loading: { title: "Procesando..." },
            success: { title: "Estado actualizado con éxito" },
            error: { title: "Error al cambiar el estado" }
        });
    };

    // --- RENDER TABLA ---
    const filasTabla = usuarios.map(u => {
        const claseInactivo = !u.activo ? "usuario-inactivo" : "";

        return [
            <input 
                type="radio"
                className="form-check-input"
                name="usuarioSeleccion"
                checked={usuarioSeleccionadoId === u.id}
                onChange={() => setUsuarioSeleccionadoId(u.id)}
            />,
            <span className={claseInactivo}>{u.nombre_persona || '-'}</span>,
            <span className={claseInactivo}>{u.apellido_persona || '-'}</span>,
            <span className={claseInactivo}>{u.email}</span>,
            <span className={claseInactivo}>{u.rol}</span>,
            <span className={claseInactivo}>{u.activo ? 'Activo' : 'Inactivo'}</span>,
            <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                <BotonAgregar accion={() => iniciarModificacion(u.id)}>
                    <img src={imagenModificar} alt="modificar" style={{width: '15px'}} />
                </BotonAgregar>
                <BotonAgregar accion={() => handleAltaBaja(u)}>
                    <img src={u.activo ? imagenDesactivar : imagenReactivar} alt="estado" style={{ width: '15px' }} />
                </BotonAgregar>
            </div>
        ];
    });

    return (
        <div className="usuarios-layout">
            <div className="usuarios-contenido">
                <div className="row usuarios mt3">
                    <div className="usuarios mt-e text-center">
                        <h1 className="mb-1 titulo-usuarios">Usuarios</h1>
                    </div>

                    <div className="filtros-container">
                        <div className="row align-items-center g-2">
                            <div className="col-lg-4 col-md-12">
                                <Form.Control
                                    type="text"
                                    placeholder="Buscar..."
                                    value={busqueda}
                                    onChange={(e) => { setBusqueda(e.target.value); setPaginaActual(1); }}
                                />
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <Form.Select value={filtroEstado} onChange={(e) => { setFiltroEstado(e.target.value); setPaginaActual(1); }}>
                                    <option value="todos">Todos los estados</option>
                                    <option value="activos">Activos</option>
                                    <option value="inactivos">No Activos</option>
                                </Form.Select>
                            </div>
                            <div className="col-lg-3 col-md-6">
                                <Form.Select value={ordenAlfabetico} onChange={(e) => setOrdenAlfabetico(e.target.value)}>
                                    <option value="ninguno">Sin orden específico</option>
                                    <option value="az">Nombre: A a Z</option>
                                    <option value="za">Nombre: Z a A</option>
                                </Form.Select>
                            </div>
                            <div className="col-lg-2 d-flex justify-content-lg-end">
                                <BotonAgregar accion={abrirAgregar}>
                                    <img src={imagenMas} alt="+" style={{ width: '13px' }} /> Agregar Usuario
                                </BotonAgregar>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="tabla-wrapper">
                    <div className="tabla-container">
                        <Tabla columnas={columnas} filas={filasTabla} />
                        <div className="d-flex justify-content-center mt-3">
                            <Pagination>
                                <Pagination.Prev onClick={() => setPaginaActual(p => Math.max(1, p - 1))} disabled={paginaActual === 1} />
                                {[...Array(totalPaginas)].map((_, i) => (
                                    <Pagination.Item key={i + 1} active={i + 1 === paginaActual} onClick={() => setPaginaActual(i + 1)}>
                                        {i + 1}
                                    </Pagination.Item>
                                ))}
                                <Pagination.Next onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))} disabled={paginaActual === totalPaginas} />
                            </Pagination>
                        </div>
                    </div>
                </div>
            </div>

            <ModalFormularios show={mostrarModal} onHide={() => setMostrarModal(false)} titulo={infoModal.titulo}>
                <Form 
                    key={claveFormulario}
                    noValidate 
                    validated={validacion}
                    onSubmit={infoModal.tipo === 'agregar' ? handleEnvioUsuario : handleActualizacionUsuario}
                >
                    <FormularioUsuario 
                        data={datosFormulario} 
                        handleChange={handleCambioFormulario} 
                        modificando={infoModal.tipo === 'modificar'} 
                        setValidacion={setValidacion}
                    />
                </Form>
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
    );
}

export default GestionUsuarios;