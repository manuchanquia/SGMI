from flask import Blueprint, request, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from database import db
from services.AdminGrupo import AdminGrupo
from models.grupo import Grupo
from models.institucion import Institucion

from utils import paginar

grupos_bp = Blueprint('grupos', __name__, url_prefix='/api/grupos')
administrador = AdminGrupo()

class ControladorGrupo(MethodView):

    @jwt_required()
    def get(self, id = None):
        if id is None:
            claims = get_jwt()
            rol_usuario = claims.get('rol')
            id_persona = claims.get('id_persona')
            
            consulta = administrador.obtenerTodosGrupos(rol_usuario, id_persona)
            return paginar(consulta, Grupo, [Institucion])
        
        else:
            grupo = administrador.obtenerUnGrupo(id)

            if grupo:
                respuesta = jsonify(grupo.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Grupo no encontrado"}), 404

    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            nuevoGrupo = administrador.crearGrupo(data)
            respuesta = {
                'mensaje': 'Grupo creado exitosamente',
                'grupo': nuevoGrupo.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            print(f"ERROR AL CREAR GRUPO: {excepcion}")
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, id):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            grupoModificado = administrador.modificarGrupo(data, id)

            if grupoModificado is None:
                return jsonify({"error": "Grupo no encontrado"}), 404
            
            respuesta = {
                'mensaje': 'Grupo modificado correctamente',
                'grupo': grupoModificado.to_dict()
            }
            return jsonify(respuesta), 200
        
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
            grupoEliminado = administrador.eliminarGrupo(id)
            
            if grupoEliminado is None: 
                return jsonify({'mensaje': 'Grupo no encontrado'}), 404
            
            respuesta = {
                'mensaje': 'Grupo eliminado correctamente'
            }
            return jsonify(respuesta), 200
        
        except ValueError as error: 
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al eliminar' + str(excepcion)}
            return jsonify(respuesta), 500

grupos_view = ControladorGrupo.as_view('controlador_grupo')

grupos_bp.add_url_rule('/', view_func = grupos_view, methods=['GET'])
grupos_bp.add_url_rule('/<int:id>', view_func = grupos_view, methods=['GET'])
grupos_bp.add_url_rule('/', view_func = grupos_view, methods=['POST'])
grupos_bp.add_url_rule('/<int:id>', view_func = grupos_view, methods=['PUT'])
grupos_bp.add_url_rule('/<int:id>', view_func = grupos_view, methods=['DELETE'])
