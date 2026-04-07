from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from database import db
from services.AdminProyecto import AdminProyecto
from models.proyecto import Proyecto

from utils import paginar

proyectos_bp = Blueprint('proyectos', __name__, url_prefix='/api/proyectos')
administrador = AdminProyecto()

class ControladorProyecto(MethodView):

    @jwt_required()
    def get(self, id = None, planificacion = None):

        claims = get_jwt()
        rol_usuario = claims.get('rol', 'consulta')
        id_persona = claims.get('id_persona')

        if id is not None:
            proyecto = administrador.obtenerUnProyecto(id)

            if proyecto:
                respuesta = jsonify(proyecto.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Proyecto no encontrado"}), 404
    
        elif planificacion is not None:
            consulta = administrador.obtenerProyectosDePlanificacion(planificacion, rol_usuario, id_persona)
            return paginar(consulta, Proyecto)

        else:
            consulta = administrador.obtenerTodoProyectos(rol_usuario, id_persona)
            return paginar(consulta, Proyecto)
        
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
         
        data = request.get_json()
        try:
            nuevoProyecto = administrador.crearProyecto(data)
            respuesta = {
                'mensaje': 'Proyecto creado exitosamente',
                'proyecto': nuevoProyecto.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, idProyecto):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
    
        data = request.get_json()
        try:
            proyectoModificado = administrador.modificarProyecto(data, idProyecto)
            respuesta = {
                'mensaje': 'Proyecto modificado correctamente',
                'proyecto': proyectoModificado.to_dict()
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
            proyectoEliminado = administrador.eliminarProyecto(id)
            
            if proyectoEliminado is None: 
                return jsonify({'mensaje': 'Proyecto no encontrado'}), 404
            
            respuesta = {
                'mensaje': 'Proyecto eliminado correctamente',
                'Proyecto': proyectoEliminado.to_dict()
            }
            
            return jsonify(respuesta), 200
        
        except ValueError as error: 
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al eliminar' + str(excepcion)}
            return jsonify(respuesta), 500

proyectos_view = ControladorProyecto.as_view('controlador_proyecto')

proyectos_bp.add_url_rule('/', view_func = proyectos_view, methods=['GET'])
proyectos_bp.add_url_rule('/<int:id>', view_func = proyectos_view, methods=['GET'])
proyectos_bp.add_url_rule('/planificacion/<int:planificacion>', view_func = proyectos_view, methods=['GET'])
proyectos_bp.add_url_rule('/', view_func = proyectos_view, methods=['POST'])
proyectos_bp.add_url_rule('/<int:idProyecto>', view_func = proyectos_view, methods=['PUT'])
proyectos_bp.add_url_rule('/<int:id>', view_func = proyectos_view, methods=['DELETE'])