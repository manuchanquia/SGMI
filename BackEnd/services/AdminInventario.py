from datetime import date
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from flask.views import MethodView

#MODELOS
from database import db
from models.equipamiento import Equipamiento
from services.AdminPlanificacion import AdminPlanificacion

adminPlanificacion = AdminPlanificacion()


class AdminInventario(MethodView):

    def obtenerTodoInventario(self):
        return Equipamiento.query.all()
    

    def obtenerUnEquipamiento(self, id):
        return Equipamiento.query.filter_by(id = id).first()
    

    def obtenerInventarioDePlanificacion(self, planificacionId):
        return Equipamiento.query.filter_by(planificacionId = planificacionId)
    

    def crearEquipamiento(self, equipamiento):

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
                actividad = equipamiento.get('actividad')
            )

            db.session.add(nuevoEquipamiento)
            db.session.commit()

            return nuevoEquipamiento
        

        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
        

    def modificarEquipamiento(self, data, idEquipamiento):

        #NO SE PUEDE MODIFICAR LA PLANIFICACION A LA QUE EL EQUIPAMIENTO ESTE ASOCIADA

        try:
            equipamientoSeleccionado = self.obtenerUnEquipamiento(idEquipamiento)

            if not equipamientoSeleccionado:
                respuesta = {'mensaje': 'Equipamiento no encontrado'}
                return respuesta
            
            camposPermitidos = ['denominacion', 'fechaIngreso', 'monto', 'descripcion', 'actividad']

            for campo in camposPermitidos:
                if campo in data:
                    setattr(equipamientoSeleccionado, campo, data[campo])

            db.session.commit()
            return equipamientoSeleccionado
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion