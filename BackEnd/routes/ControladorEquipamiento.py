from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from database import db
from services.AdminEquipamiento import AdminEquipamiento
from models.equipamiento import Equipamiento

from utils import paginar

equipamiento_bp = Blueprint('equipamiento', __name__, url_prefix='/api/equipamiento')
administrador = AdminEquipamiento()

class ControladorEquipamiento(MethodView):

    @jwt_required()
    def get(self, id = None, planificacion = None):
        claims = get_jwt()
        rol_usuario = claims.get('rol', 'consulta')
        id_persona = claims.get('id_persona')

        if id is not None:
            equipamiento = administrador.obtenerUnEquipamiento(id)

            if equipamiento:
                respuesta = jsonify(equipamiento.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Equipamiento no encontrado"}), 404
            
    
        elif planificacion is not None:
            consulta = administrador.obtenerEquipamientoDePlanificacion(planificacion, rol_usuario, id_persona)
            return paginar(consulta, Equipamiento)

        else:
            consulta = administrador.obtenerTodoEquipamiento(rol_usuario, id_persona)
            return paginar(consulta, Equipamiento)
        
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            nuevoEquipamiento = administrador.crearEquipamiento(data)
            respuesta = {
                'mensaje': 'Equipamiento creado exitosamente',
                'equipamiento': nuevoEquipamiento.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, idEquipamiento):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            equipamientoModificado = administrador.modificarEquipamiento(data, idEquipamiento)

            if isinstance(equipamientoModificado, dict):
                return jsonify(equipamientoModificado), 404
            
            respuesta = {
                'mensaje': 'Equipamiento modificado correctamente',
                'equipamiento': equipamientoModificado.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al modificar' + str(excepcion)}
            return jsonify(respuesta), 500
    
    @jwt_required()
    def delete(self, id):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        try: 
            equipamientoEliminado = administrador.eliminarEquipamiento(id)
            
            if equipamientoEliminado is None: 
                return jsonify({'mensaje': 'Equipamiento no encontrado'}), 404
            
            respuesta = {
                'mensaje': 'Equipamiento eliminado correctamente',
                'Bibliografia': equipamientoEliminado.to_dict()
            }
            
            return jsonify(respuesta), 200
        
        except ValueError as error: 
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al eliminar' + str(excepcion)}
            return jsonify(respuesta), 500

equipamiento_view = ControladorEquipamiento.as_view('controlador_equipamiento')

equipamiento_bp.add_url_rule('/', view_func = equipamiento_view, methods=['GET'])
equipamiento_bp.add_url_rule('/<int:id>', view_func = equipamiento_view, methods=['GET'])
equipamiento_bp.add_url_rule('/planificacion/<int:planificacion>', view_func = equipamiento_view, methods=['GET'])
equipamiento_bp.add_url_rule('/', view_func = equipamiento_view, methods=['POST'])
equipamiento_bp.add_url_rule('/<int:idEquipamiento>', view_func = equipamiento_view, methods=['PUT'])
equipamiento_bp.add_url_rule('/<int:id>', view_func = equipamiento_view, methods=['DELETE'])

