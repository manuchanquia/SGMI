import os
from dotenv import load_dotenv

from flask import Flask, jsonify
from flask_cors import CORS
from database import db

from flask_jwt_extended import JWTManager
from datetime import timedelta

app = Flask(__name__)
app.url_map.strict_slashes = False
#CORS(app) 

CORS(app, resources={r"/api/*": {"origins": ["http://localhost:5173", "http://localhost:5174"]}}, supports_credentials=True)

# Cargar variables de entorno del archivo .env
load_dotenv()

#configuracion base de datos
DATABASE_URI = os.getenv('DATABASE_URL')

app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URI
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

app.config["JWT_SECRET_KEY"] = "clave_secreta"
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(hours=8)
jwt = JWTManager(app)

db.init_app(app)

# ============ Import Models ============
from models.bibliografia import Bibliografia
from models.equipamiento import Equipamiento
from models.grupo import Grupo
from models.personal import Personal, Becario, Investigador, Profesional, Soporte, Visitante
from models.proyecto import Proyecto
from models.planificacion import Planificacion
from models.persona import Persona
from models.institucion import Institucion

# ============ Import Routes ============
from routes.ControladorEquipamiento import equipamiento_bp
from routes.ControladorPersonal import personal_bp
from routes.ControladorProyecto import proyectos_bp
from routes.ControladorGrupo import grupos_bp
from routes.ControladorInstitucion import institucion_bp
from routes.ControladorPlanificacion import planificaciones_bp
from routes.ControladorBibliografia import bibliografia_bp
from routes.ControladorPersona import persona_bp
from routes.ControladorEnumerativas import enumerativas_bp
from routes.ControladorLogin import login_bp
from routes.ControladorExcel import excel_bp
from routes.ControladorUsuario import usuarios_bp


# ============ Register Blueprints ============
app.register_blueprint(equipamiento_bp, url_prefix='/api/equipamiento')
app.register_blueprint(bibliografia_bp, url_prefix='/api/bibliografia')
app.register_blueprint(grupos_bp, url_prefix='/api/grupos')
app.register_blueprint(personal_bp, url_prefix='/api/personal')
app.register_blueprint(proyectos_bp, url_prefix='/api/proyectos')
app.register_blueprint(institucion_bp, url_prefix='/api/institucion')
app.register_blueprint(planificaciones_bp, url_prefix='/api/planificacion')
app.register_blueprint(persona_bp, url_prefix='/api/personas')
app.register_blueprint(enumerativas_bp, url_prefix='/api/enumerativas')
app.register_blueprint(login_bp, url_prefix='/api/login')
app.register_blueprint(excel_bp, url_prefix='/api/excel')
app.register_blueprint(usuarios_bp, url_prefix='/api/usuarios')



#Prueba para ver que todo este instalado correctamente
@app.route("/api/hello")
def get_hello():
    return jsonify({"message": "ESTO ES UNA PRUEBA"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    