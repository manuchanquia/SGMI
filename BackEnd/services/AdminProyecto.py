from flask.views import MethodView
from database import db
from models.proyecto import Proyecto
from services.AdminPlanificacion import AdminPlanificacion
from models.planificacion import Planificacion
from models.personal import Personal
from datetime import datetime

adminPlanificacion = AdminPlanificacion()

class AdminProyecto(MethodView):

    def obtenerTodoProyectos(self, rol='superadmin', id_persona=None):
        consulta = Proyecto.query
        if rol != 'superadmin' and id_persona is not None:
            consulta = consulta.join(
                Planificacion, Proyecto.planificacionId == Planificacion.id
            ).join(
                Personal, Planificacion.id == Personal.planificacionId
            ).filter(
                Personal.personaId == id_persona
            ).distinct()
        return consulta
    
    def obtenerUnProyecto(self, id):
        return Proyecto.query.filter_by(id = id).first()
    
    def obtenerProyectosDePlanificacion(self, planificacionId, rol='superadmin', id_persona=None):
        consulta = Proyecto.query.filter_by(planificacionId = planificacionId)
        if rol != 'superadmin' and id_persona is not None:
            consulta = consulta.join(
                Planificacion, Proyecto.planificacionId == Planificacion.id
            ).join(
                Personal, Planificacion.id == Personal.planificacionId
            ).filter(
                Personal.personaId == id_persona
            ).distinct()
        return consulta

    def crearProyecto(self, proyecto):
        requeridos = ['codigo', 'nombre', 'tipo', 'fechaInicio', 'planificacionId']
        for campo in requeridos:
            if not proyecto.get(campo):
                raise ValueError(f"El campo '{campo}' es requerido.")

        id_planificacion = proyecto.get('planificacionId')
        planificacion_seleccionada = adminPlanificacion.obtenerUnaPlanificacion(id_planificacion)
        
        if not planificacion_seleccionada:
            raise ValueError("No existe la planificacion seleccionada")

        # --- CORRECCIÓN AQUÍ: Validación de código por Planificación ---
        existente = Proyecto.query.filter_by(
            codigo=proyecto.get('codigo'), 
            planificacionId=id_planificacion
        ).first()

        if existente:
            raise ValueError(f"Ya existe un proyecto registrado con el código {proyecto.get('codigo')} en esta planificación.")

        try:
            nuevoProyecto = Proyecto(
                codigo = proyecto.get('codigo'),
                nombre = proyecto.get('nombre'),
                descripcion = proyecto.get('descripcion'),
                tipo = proyecto.get('tipo'),
                logros = proyecto.get('logros'),
                dificultades = proyecto.get('dificultades'),
                fechaInicio = proyecto.get('fechaInicio'),
                fechaFin = proyecto.get('fechaFin'),
                financiamiento = proyecto.get('financiamiento'),
                activo = proyecto.get('activo'),
                planificacionId = id_planificacion
            )

            db.session.add(nuevoProyecto)
            db.session.commit()
            return nuevoProyecto

        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
        
    def modificarProyecto(self, data, idProyecto):
        try:
            # Aseguramos que el ID sea entero para evitar fallos de identidad en la base de datos
            id_proyecto_int = int(idProyecto)
            proyectoSeleccionado = self.obtenerUnProyecto(id_proyecto_int)

            if not proyectoSeleccionado:
                return None
            
            if 'codigo' in data:
                # Validamos código duplicado excluyendo el proyecto actual y filtrando por planificación
                existente = Proyecto.query.filter(
                    Proyecto.codigo == data['codigo'], 
                    Proyecto.id != id_proyecto_int,
                    Proyecto.planificacionId == proyectoSeleccionado.planificacionId
                ).first()
                    
                if existente:
                    raise ValueError("El nuevo código ya está siendo usado por otro proyecto en esta planificación.")
            
            camposPermitidos = ['codigo', 'nombre', 'descripcion', 'tipo', 'logros', 'dificultades', 'fechaInicio', 'fechaFin', 'activo', 'financiamiento']

            for campo in camposPermitidos:
                if campo in data:
                    setattr(proyectoSeleccionado, campo, data[campo])

            db.session.commit()
            return proyectoSeleccionado
            
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
    
    def eliminarProyecto(self, idProyecto):
        try:
            proyectoSeleccionado = self.obtenerUnProyecto(idProyecto)
            if not proyectoSeleccionado:
                return None
            db.session.delete(proyectoSeleccionado)
            db.session.commit()
            return proyectoSeleccionado
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion