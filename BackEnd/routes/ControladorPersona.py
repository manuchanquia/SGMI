from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt

#MODELOS
from database import db
from services.AdminPersona import AdminPersona
from models.persona import Persona

from utils import paginar

persona_bp = Blueprint('persona', __name__, url_prefix='/api/personas')
administrador = AdminPersona()

@persona_bp.route('/buscar', methods=['GET'])
def buscarPersona():
    numero = request.args.get('numero')
    
    if not numero:
        return jsonify([]), 200 
    personas = administrador.obtenerPersonasPorDocumentoParcial(numero)
    
    if personas:
        return jsonify([p.to_dict() for p in personas]), 200
    return jsonify([]), 200

class ControladorPersona(MethodView):
    @jwt_required()
    def get(self, id = None):
        if id is not None:
            persona = administrador.obtenerUnaPersona(id)
            if persona:
                respuesta = jsonify(persona.to_dict())
                return respuesta, 200
            else:
                respuesta = jsonify({"error" : "Persona no encontrada"}), 404

        else:
            consulta = administrador.obtenerTodasPersonas()
            return paginar(consulta, Persona)
        
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            nuevaPersona = administrador.crearPersona(data)
            respuesta = {
                'mensaje': 'Persona creada exitosamente',
                'persona': nuevaPersona.to_dict()
            }
            return jsonify(respuesta), 201
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al crear' + str(excepcion)}
            return jsonify(respuesta), 500

    @jwt_required()
    def put(self, idPersona):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'No tienes permisos para realizar esta accion'}), 403 
        
        data = request.get_json()
        try:
            personaModificada = administrador.modificarPersona(data, idPersona)

            if personaModificada is None:
                return jsonify({'mensaje': 'Persona no encontrada'}), 404
            
            respuesta = {
                'mensaje': 'Persona modificada correctamente',
                'persona': personaModificada.to_dict()
            }
            return jsonify(respuesta), 200
        
        except ValueError as error:
            respuesta = {'mensaje': str(error)}
            return jsonify(respuesta), 400
        
        except Exception as excepcion:
            respuesta = {'mensaje': 'Error al modificar' + str(excepcion)}
            return jsonify(respuesta), 500

persona_view = ControladorPersona.as_view('controlador_persona')

persona_bp.add_url_rule('/', view_func = persona_view, methods=['GET'])
persona_bp.add_url_rule('/<int:id>', view_func = persona_view, methods=['GET'])

persona_bp.add_url_rule('/', view_func = persona_view, methods=['POST'])

persona_bp.add_url_rule('/<int:idPersona>', view_func = persona_view, methods=['PUT'])