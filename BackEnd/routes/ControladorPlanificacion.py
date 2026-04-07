from flask import Blueprint, request, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from models.planificacion import Planificacion
from database import db
from services.AdminPlanificacion import AdminPlanificacion

from utils import paginar

planificaciones_bp = Blueprint('planificaciones', __name__, url_prefix='/api/planificacion')
administrador = AdminPlanificacion()

class ControladorPlanificacion(MethodView):

    @jwt_required()
    def get(self, id = None, grupo = None):
        if id is not None:
            planificacion = administrador.obtenerUnaPlanificacion(id)

            if planificacion:
                respuesta = jsonify(planificacion.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Planificacion no encontrada"}), 404
    
        elif grupo is not None:
            consulta = administrador.obtenerPlanificacionesDeGrupo(grupo)
            return paginar(consulta, Planificacion)

        else:
            consulta = administrador.obtenerTodasPlanificaciones()
            return paginar(consulta, Planificacion)

    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 

        data = request.get_json()
        try:
            nuevaPlanificacion = administrador.crearPlanificacion(data)
            respuesta = {
                'mensaje': 'Planificacion creada exitosamente',
                'planificacion': nuevaPlanificacion.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, idPlanificacion):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            planificacionModificada = administrador.modificarPlanificacion(data, idPlanificacion)

            if planificacionModificada is None:
                return jsonify({"error": "Planificacion no encontrada"}), 404
            
            respuesta = {
                'mensaje': 'Planificacion modificada correctamente',
                'planificacion': planificacionModificada.to_dict()
            }
            return jsonify(respuesta), 200
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al modificar' + str(excepcion)}
            return jsonify(respuesta), 500
        
planificaciones_view = ControladorPlanificacion.as_view('controlador_planificacion')

planificaciones_bp.add_url_rule('/', view_func = planificaciones_view, methods=['GET'])
planificaciones_bp.add_url_rule('/<int:id>', view_func = planificaciones_view, methods=['GET'])
planificaciones_bp.add_url_rule('/grupo/<int:grupo>', view_func = planificaciones_view, methods=['GET'])

planificaciones_bp.add_url_rule('/', view_func = planificaciones_view, methods=['POST'])

planificaciones_bp.add_url_rule('/<int:idPlanificacion>', view_func = planificaciones_view, methods=['PUT'])