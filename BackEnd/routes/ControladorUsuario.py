from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import jwt_required, get_jwt
from models.usuario import Usuario
from services.AdminLogin import AdminLogin
from utils import paginar
from models.persona import Persona

usuarios_bp = Blueprint('usuarios', __name__, url_prefix='/api/usuarios')
administrador = AdminLogin()

class ControladorUsuario(MethodView):

    @jwt_required()
    def get(self, id=None):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'Acceso denegado'}), 403

        if id:
            usuario = administrador.obtener_un_usuario(id)
            if usuario:
                return jsonify(usuario.to_dict()), 200
            return jsonify({'error': 'Usuario no encontrado'}), 404

        consulta = administrador.obtener_todos_usuarios().outerjoin(Persona)
        return paginar(consulta, Usuario)
    
    @jwt_required()
    def post(self):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'Acceso denegado'}), 403

        datos = request.get_json()
        
        try:
            nuevoUsuario = administrador.crear_nuevo_usuario(datos)
            return jsonify({'mensaje': 'Usuario creado con éxito'}), 201
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': str(e)}), 500


    @jwt_required()
    def put(self, id):
        claims = get_jwt()
        if claims.get('rol') not in ['admin', 'superadmin']:
            return jsonify({'error': 'Acceso denegado'}), 403

        datos = request.get_json()
        
        try:
            usuarioModificado = administrador.modificar_usuario(id, datos)
            if usuarioModificado:
                return jsonify({'mensaje': 'Usuario actualizado con éxito'}), 200
            return jsonify({'error': 'Usuario no encontrado'}), 404
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': 'Error al actualizar'}), 500


usuarios_view = ControladorUsuario.as_view('controlador_usuario')

usuarios_bp.add_url_rule('/', view_func=usuarios_view, methods=['GET', 'POST'])
usuarios_bp.add_url_rule('/<int:id>', view_func=usuarios_view, methods=['GET', 'PUT'])