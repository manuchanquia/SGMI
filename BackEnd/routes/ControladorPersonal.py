from flask import Blueprint, request, jsonify
from flask.views import MethodView
from database import db
from flask_jwt_extended import jwt_required, get_jwt

from models.personal import Personal
from services.AdminPersonal import AdminPersonal
from models.persona import Persona

from utils import paginar

personal_bp = Blueprint('personal_bp', __name__)
administrador = AdminPersonal()

class ControladorPersonal(MethodView):

    @jwt_required()
    def get(self, id = None, planificacionId = None):
        claims = get_jwt()
        rol_usuario = claims.get('rol', 'consulta')
        id_persona = claims.get('id_persona')
        
        if id is not None:
            personal = administrador.obtenerUnPersonal(id)

            if personal:
                respuesta = jsonify(personal.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Personal no encontrado"}), 404
        
        elif planificacionId is not None: 
            consulta = administrador.obtenerPersonalDePlanificacion(planificacionId, rol_usuario, id_persona).join(Persona)
            return paginar(consulta, Personal, [Persona])

        else:
            consulta = administrador.obtenerTodoPersonal(rol_usuario, id_persona).join(Persona)
            return paginar(consulta, Personal, [Persona])

    @jwt_required()
    def post(self, operacion = None):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 

        if operacion not in {1, 2, 3, 4, 5}:
        
            respuesta = {'mensaje': "Operacion invalida: 1 - Profesional, 2 - Soporte, 3 - Becario, 4 - Visitante, 5 - Investigador"}
            return jsonify(respuesta), 400

        data = request.get_json()

        try:
            nuevoPersonal = administrador.crearPersonal(data, operacion)
            respuesta = {
                'mensaje': 'Personal creado exitosamente',
                'personal': nuevoPersonal.to_dict()
            }
            return jsonify(respuesta), 201

        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400

        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, id):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 

        data = request.get_json()
        try:
            personalModificado = administrador.modificarPersonal(data, id)
            respuesta = {
                'mensaje': 'Personal modificado correctamente',
                'personal': personalModificado.to_dict()
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
            personalEliminado = administrador.eliminarPersonal(id)
            
            if personalEliminado is None: 
                return jsonify({'mensaje': 'Personal no encontrado'}), 404
            
            respuesta = {
                'mensaje': 'Personal eliminado correctamente',
                'Personal': personalEliminado
            }
            
            return jsonify(respuesta), 200
        
        except ValueError as error: 
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al eliminar' + str(excepcion)}
            return jsonify(respuesta), 500
    
personal_view = ControladorPersonal.as_view('controlador_personal')

personal_bp.add_url_rule('/', view_func=personal_view, methods=['GET'])
personal_bp.add_url_rule('/<int:id>', view_func=personal_view, methods=['GET'])
personal_bp.add_url_rule('/planificacion/<int:planificacionId>', view_func=personal_view, methods=['GET'])
personal_bp.add_url_rule('/<int:operacion>', view_func=personal_view, methods=['POST'])
personal_bp.add_url_rule('/<int:id>', view_func = personal_view, methods=['PUT'])
personal_bp.add_url_rule('/<int:id>', view_func = personal_view, methods=['DELETE'])