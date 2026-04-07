from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from database import db
from services.AdminInventario import AdminInventario
from models.equipamiento import Equipamiento

inventario_bp = Blueprint('inventario', __name__, url_prefix='/api/inventario')
administrador = AdminInventario()

# EL CONTROLLER DE INVENTARIO DEBE:
# 1. Crear un inventario (tupla) y relacionarla a una planificacion
# 2. Listar todo el inventario (tuplas) relacionado a una planificacion
# 3. Buscar un inventario (tupla) por id
# 4. Eliminar un inventario (tupla) por id
# 5. Modificar un inventario (tupla) por id

class ControladorInventario(MethodView):

    @jwt_required()
    def get(self, id = None, planificacion = None):
        if id is not None:
            equipamiento = administrador.obtenerUnEquipamiento(id)

            if equipamiento:
                respuesta = jsonify(equipamiento.to_dict())
                return respuesta, 200

            else:
                respuesta = jsonify({"error" : "Equipamiento no encontrado"}), 404
            
    
        elif planificacion is not None:
            lista_inventario = administrador.obtenerInventarioDePlanificacion(planificacion)
            respuesta = jsonify([equipamiento.to_dict() for equipamiento in lista_inventario])
            return respuesta, 200

        else:
            lista_inventario = administrador.obtenerTodoInventario()
            respuesta = jsonify([equipamiento.to_dict() for equipamiento in lista_inventario])
            return respuesta, 200
        
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims['rol'] != 'admin':
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
        if claims['rol'] != 'admin':
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            equipamientoModificado = administrador.modificarEquipamiento(data, idEquipamiento)
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

inventario_view = ControladorInventario.as_view('controlador_inventario')

inventario_bp.add_url_rule('/', view_func = inventario_view, methods=['GET'])
inventario_bp.add_url_rule('/<int:id>', view_func = inventario_view, methods=['GET'])
inventario_bp.add_url_rule('/planificacion/<int:planificacion>', view_func = inventario_view, methods=['GET'])

inventario_bp.add_url_rule('/', view_func = inventario_view, methods=['POST'])

inventario_bp.add_url_rule('/<int:idEquipamiento>', view_func = inventario_view, methods=['PUT'])