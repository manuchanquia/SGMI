from flask.views import MethodView
from datetime import date

#MODELOS
from database import db
from models.planificacion import Planificacion
from services.AdminGrupo import AdminGrupo

adminGrupo = AdminGrupo()

class AdminPlanificacion(MethodView):

    def obtenerTodasPlanificaciones(self):
        return Planificacion.query
    
    def obtenerUnaPlanificacion(self, id):
        return Planificacion.query.filter_by(id = id).first()
    
    def obtenerPlanificacionesDeGrupo(self, grupoId):
        return Planificacion.query.filter_by(grupoId = grupoId)

    def crearPlanificacion(self, planificacion):
        id_grupo = planificacion.get('grupoId')
        anio_plan = planificacion.get('anio')

        if not id_grupo or not anio_plan:
            raise ValueError("El ID del grupo y el año son obligatorios.")

        grupo_seleccionado = adminGrupo.obtenerUnGrupo(id_grupo)
        
        if grupo_seleccionado is None:
            raise ValueError(f"El grupo con ID {id_grupo} no existe.")
        
        planificacion_existente = Planificacion.query.filter_by(
            anio=anio_plan) 

        anio_bruto = planificacion.get('anio')
        
        try:
        
            if isinstance(anio_bruto, str):
                anio_int = int(anio_bruto[:4])
            else:
                anio_int = int(anio_bruto)
            
            fecha_para_db = date(anio_int, 1, 1)
            
        except (ValueError, TypeError):
            raise ValueError("El formato del año no es válido")

        planificacion_existente = Planificacion.query.filter_by(
            anio=fecha_para_db, 
            grupoId=id_grupo
        ).first()

        if planificacion_existente:
            raise ValueError(f"Ya existe una planificación para el año {anio_int}")

        try:
            nuevaPlanificacion = Planificacion(
                grupoId=id_grupo,
                anio=fecha_para_db, 
                activa=planificacion.get('activa', True)
            )

            db.session.add(nuevaPlanificacion)
            db.session.commit()
            return nuevaPlanificacion

        except Exception as excepcion:
            db.session.rollback()
            raise excepcion

    def modificarPlanificacion(self, data, idPlanificacion):
        try:
            planificacionSeleccionada = self.obtenerUnaPlanificacion(idPlanificacion)

            if not planificacionSeleccionada:
                return None
            
            if 'activa' in data:
                planificacionSeleccionada.activa = data['activa']

            db.session.commit()
            return planificacionSeleccionada
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion