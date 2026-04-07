from flask import Blueprint, jsonify, request
from flask.views import MethodView
from flask_jwt_extended import create_access_token
from services.AdminLogin import AdminLogin

login_bp = Blueprint('login', __name__)
administrador = AdminLogin()

class ControladorLogin(MethodView):

    def post(self):
        data = request.get_json()
        usuario = administrador.verificar_credenciales(data.get('email'), data.get('clave'))

        if usuario:
            nombre_p = usuario.get('nombre_persona')
            apellido_p = usuario.get('apellido_persona')
            if nombre_p and apellido_p:
                nombre = f"{nombre_p} {apellido_p}".strip()
            else:
                nombre = usuario['email']

            token = create_access_token(
                identity=str(usuario['id']), 
                additional_claims={
                    'rol': usuario['rol'], 
                    'nombre_usuario': nombre,
                    'id_persona': usuario.get('id_persona')
                }
            )
            return jsonify({
                'mensaje': 'Inicio de sesión exitoso',
                'token': token,     
                'usuario': usuario
            }), 200
        else:
            return jsonify({'error': 'Credenciales inválidas'}), 401
        
login_view = ControladorLogin.as_view('controlador_login')
login_bp.add_url_rule('/', view_func=login_view, methods=['POST'])