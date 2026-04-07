from flask.views import MethodView

#MODELOS
from database import db
from models.equipamiento import Equipamiento
from services.AdminPlanificacion import AdminPlanificacion
from models.planificacion import Planificacion
from models.personal import Personal

adminPlanificacion = AdminPlanificacion()

class AdminEquipamiento(MethodView):

    def obtenerTodoEquipamiento(self, rol='superadmin', id_persona=None):
        consulta = Equipamiento.query

        if rol != 'superadmin' and id_persona is not None:
            grupos_usuario = db.session.query(Planificacion.grupoId).join(Personal).filter(Personal.personaId == id_persona).subquery()
            consulta = consulta.join(Planificacion).filter(
                Planificacion.grupoId.in_(grupos_usuario)
            ).distinct()

        return consulta
    

    def obtenerUnEquipamiento(self, id):
        return Equipamiento.query.get(id)
    

    def obtenerEquipamientoDePlanificacion(self, planificacionId, rol='superadmin', id_persona=None):
        consulta = Equipamiento.query.filter_by(planificacionId = planificacionId)

        if rol != 'superadmin' and id_persona is not None:
            grupos_usuario = db.session.query(Planificacion.grupoId).join(Personal).filter(Personal.personaId == id_persona).subquery()
            consulta = consulta.join(Planificacion).filter(
                Planificacion.grupoId.in_(grupos_usuario)
            ).distinct()

        return consulta
    

    def crearEquipamiento(self, equipamiento):

        requeridos = ['denominacion', 'fechaIngreso', 'monto', 'planificacionId']
        for campo in requeridos:
            if campo not in equipamiento or equipamiento    [campo] is None:
                raise ValueError(f"El campo '{campo}' es obligatorio para el registro.")
            
        #verificar si existe la planificacion
        id_planificacion = equipamiento.get('planificacionId')
        planificacion_seleccionada = adminPlanificacion.obtenerUnaPlanificacion(id_planificacion)
        
        if planificacion_seleccionada is None:
            raise ValueError("No existe la planificacion seleccionada")

        try:
            nuevoEquipamiento = Equipamiento(
                denominacion = equipamiento.get('denominacion'),
                fechaIngreso = equipamiento.get('fechaIngreso'),
                monto = equipamiento.get('monto'),
                descripcion = equipamiento.get('descripcion'),
                planificacionId = equipamiento.get('planificacionId'),
                actividad = equipamiento.get('actividad'),
                activo = equipamiento.get('activo')if equipamiento.get('activo') is not None else True
            )

            db.session.add(nuevoEquipamiento)
            db.session.commit()

            return nuevoEquipamiento
        

        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
        

    def modificarEquipamiento(self, data, idEquipamiento):
        try:
            equipamientoSeleccionado = self.obtenerUnEquipamiento(idEquipamiento)
            if not equipamientoSeleccionado:
                respuesta = {'mensaje': 'Equipamiento no encontrado'}
                return respuesta
            
            camposPermitidos = ['denominacion', 'fechaIngreso', 'monto', 'descripcion', 'actividad', 'activo']

            for campo in camposPermitidos:
                if campo in data:
                    setattr(equipamientoSeleccionado, campo, data[campo])

            db.session.commit()
            return equipamientoSeleccionado
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
    
    def eliminarEquipamiento(self, idEquipamiento):
        try:
            equipamientoSeleccionado = self.obtenerUnEquipamiento(idEquipamiento)
            
            if not equipamientoSeleccionado:
                return None
            
            db.session.delete(equipamientoSeleccionado)
            db.session.commit()
            
            return equipamientoSeleccionado
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion