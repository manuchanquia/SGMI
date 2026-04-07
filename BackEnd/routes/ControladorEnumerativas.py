from flask import Blueprint, jsonify
from flask.views import MethodView
from services.AdminEnumerativas import AdminEnumerativas
from flask_jwt_extended import jwt_required

enumerativas_bp = Blueprint('enumerativas_bp', __name__)
administrador_enums = AdminEnumerativas()

class ControladorEnumerativas(MethodView):

    @jwt_required()
    def get(self):
        try:
            opciones = administrador_enums.obtener_todas_las_opciones()
            return jsonify(opciones), 200
            
        except Exception as excepcion:
            return jsonify({'error': 'Error al obtener opciones: ' + str(excepcion)}), 500

enumerativas_view = ControladorEnumerativas.as_view('controlador_enumerativas')
enumerativas_bp.add_url_rule('/', view_func=enumerativas_view, methods=['GET'])