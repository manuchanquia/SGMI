from flask import Blueprint, request, jsonify
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS 
from database import db
from services.AdminInstitucion import AdminInstitucion
from models.institucion import Institucion

from utils import paginar

institucion_bp = Blueprint('institucion', __name__)
administador = AdminInstitucion()

class ControladorInstitucion(MethodView):
    
    @jwt_required()
    def get(self, id = None):
        if id is None:
            consulta = administador.obtenerTodasInstituciones()
            return paginar(consulta, Institucion)
        
        else:
            institucion = administador.obtenerUnaInstitucion(id)
            
            if institucion:
                respuesta = jsonify(institucion.to_dict())
                return respuesta, 200
            
            else:
                respuesta = jsonify({"error" : "Institucion no encontrada"}), 404
                
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            nuevaInstitucion = administador.crearInstitucion(data)
            respuesta = {
                'mensaje': 'Institucion creada exitosamente',
                'institucion': nuevaInstitucion.to_dict()
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
            institucionModificada = administador.modificarInstitucion(data, id)
            if institucionModificada is None:
                return jsonify({"error": "Institución no encontrada"}), 404
            respuesta = {
                'mensaje': 'Institucion modificada correctamente',
                'Institucion': institucionModificada.to_dict()
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
            institucionEliminada = administador.eliminarInstitucion(id)
            
            if institucionEliminada is None: 
                return jsonify({'mensaje': 'Institucion no encontrada'}), 404
            
            respuesta = {
                'mensaje': 'Institucion eliminada correctamente',
                'Institucion': institucionEliminada.to_dict()
            }
            
            return jsonify(respuesta), 200
        
        except ValueError as error: 
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al eliminar' + str(excepcion)}
            return jsonify(respuesta), 500
        
institucion_view = ControladorInstitucion.as_view('controlador_institucion')

institucion_bp.add_url_rule('/', view_func = institucion_view, methods = ['GET'])
institucion_bp.add_url_rule('/<int:id>', view_func = institucion_view, methods=['GET'])

institucion_bp.add_url_rule('/', view_func = institucion_view, methods=['POST'])

institucion_bp.add_url_rule('/<int:id>', view_func = institucion_view, methods=['PUT'])

institucion_bp.add_url_rule('/<int:id>', view_func = institucion_view, methods=['DELETE'])
