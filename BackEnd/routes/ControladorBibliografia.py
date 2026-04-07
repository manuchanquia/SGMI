from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from database import db
from services.AdminBibliografia import AdminBibliografia
from models.bibliografia import Bibliografia

from utils import paginar

bibliografia_bp = Blueprint('bibliografia', __name__, url_prefix='/api/bibliografia')
administrador = AdminBibliografia()

class ControladorBibliografia(MethodView):

    @jwt_required()
    def get(self, id = None, planificacion = None):

        claims = get_jwt()
        rol_usuario = claims.get('rol', 'consulta')
        id_persona = claims.get('id_persona')

        #bsucar por id
        if id is not None:
            bibliografia = administrador.obtenerUnaBibliografia(id)

            if bibliografia:
                respuesta = jsonify(bibliografia.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Bibliografia no encontrado"}), 404
    
        #listar por planificacion
        elif planificacion is not None:
            consulta = administrador.obtenerBibliografiaDePlanificacion(planificacion, rol_usuario, id_persona)
            return paginar(consulta, Bibliografia)

        #listar todo
        else:
            consulta = administrador.obtenerTodaBibliografia(rol_usuario, id_persona)
            return paginar(consulta, Bibliografia)
        
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 

        data = request.get_json()
        try:
            nuevaBibliografia = administrador.crearBibliografia(data)
            respuesta = {
                'mensaje': 'Bibliografia creada exitosamente',
                'bibliografia': nuevaBibliografia.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, idBibliografia):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            bibliografiaModificada = administrador.modificarBibliografia(data, idBibliografia)

            if isinstance(bibliografiaModificada, dict) and 'mensaje' in bibliografiaModificada:
                return jsonify(bibliografiaModificada), 404
            
            respuesta = {
                'mensaje': 'Bibliografia modificada correctamente',
                'bibliografia': bibliografiaModificada.to_dict()
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
            bibliografiaEliminada = administrador.eliminarBibliografia(id)
            
            if bibliografiaEliminada is None: 
                return jsonify({'mensaje': 'Bibliografia no encontrada'}), 404
            
            respuesta = {
                'mensaje': 'Bibliografia eliminada correctamente',
                'Bibliografia': bibliografiaEliminada.to_dict()
            }
            
            return jsonify(respuesta), 200
        
        except ValueError as error: 
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al eliminar' + str(excepcion)}
            return jsonify(respuesta), 500

bibliografia_view = ControladorBibliografia.as_view('controlador_bibliografia')

bibliografia_bp.add_url_rule('/', view_func = bibliografia_view, methods=['GET'])
bibliografia_bp.add_url_rule('/<int:id>', view_func = bibliografia_view, methods=['GET'])
bibliografia_bp.add_url_rule('/planificacion/<int:planificacion>', view_func = bibliografia_view, methods=['GET'])
bibliografia_bp.add_url_rule('/', view_func = bibliografia_view, methods=['POST'])
bibliografia_bp.add_url_rule('/<int:idBibliografia>', view_func = bibliografia_view, methods=['PUT'])
bibliografia_bp.add_url_rule('/<int:id>', view_func=bibliografia_view, methods=['DELETE'])