from datetime import date
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from flask.views import MethodView

#MODELOS
from database import db
from models.bibliografia import Bibliografia
from services.AdminPlanificacion import AdminPlanificacion
from models.planificacion import Planificacion
from models.personal import Personal

adminPlanificacion = AdminPlanificacion()


class AdminBibliografia(MethodView):

    def obtenerTodaBibliografia(self,rol='superadmin', id_persona=None):
        consulta = Bibliografia.query

        if rol != 'superadmin' and id_persona is not None:
            grupos_usuario = db.session.query(Planificacion.grupoId).join(Personal).filter(Personal.personaId == id_persona).subquery()
            consulta = consulta.join(Planificacion).filter(
                Planificacion.grupoId.in_(grupos_usuario)
            ).distinct()

        return consulta
    
    def obtenerUnaBibliografia(self, id):
        return Bibliografia.query.get(id)
    
    def obtenerBibliografiaDePlanificacion(self, planificacionId, rol='superadmin', id_persona=None):
        consulta = Bibliografia.query.filter_by(planificacionId = planificacionId)
        
        if rol != 'superadmin' and id_persona is not None:
            grupos_usuario = db.session.query(Planificacion.grupoId).join(Personal).filter(Personal.personaId == id_persona).subquery()
            consulta = consulta.join(Planificacion).filter(
                Planificacion.grupoId.in_(grupos_usuario)
            ).distinct()

        return consulta
    
    def crearBibliografia(self, bibliografia):

        campos_obligatorios = ['titulo', 'autores', 'editorial', 'fecha', 'planificacionId']
        for campo in campos_obligatorios:
            if not bibliografia.get(campo):
                raise ValueError(f"El campo '{campo}' es obligatorio.")

        #verificar si existe la planificacion
        id_planificacion = bibliografia.get('planificacionId')
        planificacion_seleccionada = adminPlanificacion.obtenerUnaPlanificacion(id_planificacion)
        
        if planificacion_seleccionada is None:
            raise ValueError("No existe la planificacion seleccionada")

        """fecha_str = bibliografia.get('fecha')
        anio_provisto = bibliografia.get('anio')
        
        if fecha_str and anio_provisto:
            anio_de_fecha = int(fecha_str.split('-')[0])
            if anio_de_fecha != int(anio_provisto):
                raise ValueError("El año no coincide con la fecha de publicación proporcionada.")"""

        try:
            nuevaBibliografia = Bibliografia(
                titulo = bibliografia.get('titulo'),
                autores = bibliografia.get('autores'),
                editorial = bibliografia.get('editorial'),
                fecha = bibliografia.get('fecha'),
                planificacionId = bibliografia.get('planificacionId'),
                anio = bibliografia.get('anio'),
                activo = bibliografia.get('activo')if bibliografia.get('activo') is not None else True
            )

            db.session.add(nuevaBibliografia)
            db.session.commit()

            return nuevaBibliografia

        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
        

    def modificarBibliografia(self, data, idBibliografia):

        try:
            bibliografiaSeleccionada = Bibliografia.query.get(idBibliografia)

            if not bibliografiaSeleccionada:
                respuesta = {'mensaje': 'Bibliografia no encontrada'}
                return respuesta
            
            camposPermitidos = ['autores', 'editorial', 'fecha', 'titulo', "anio", "activo"]

            for campo in camposPermitidos:
                if campo in data:
                    setattr(bibliografiaSeleccionada, campo, data[campo])

            db.session.commit()
            return bibliografiaSeleccionada
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
    
    def eliminarBibliografia(self, idBibliografia):
        
        try:
            
            bibliografiaSeleccionada = self.obtenerUnaBibliografia(idBibliografia)
            
            if not bibliografiaSeleccionada:
                return None
            
            db.session.delete(bibliografiaSeleccionada)
            db.session.commit()
            
            return bibliografiaSeleccionada
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion