import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app
from database import db
from models.usuario import Usuario
import bcrypt

def crear_usuarios_prueba():
    # Es necesario el contexto de la app para acceder a la BD
    with app.app_context():
        print("--- Iniciando creación de usuarios ---")

        # 1. Definir contraseñas encriptadas
        clave_plana = "123456"
        clave_hash = bcrypt.hashpw(clave_plana.encode('utf-8'), bcrypt.gensalt())

        # 2. Crear Usuario ADMIN
        # Verificamos si ya existe para no duplicar
        admin = Usuario.query.filter_by(email="admin@test.com").first()
        if not admin:
            admin = Usuario(
                email="admin@test.com",
                clave=clave_hash,
                rol="admin",    
            )
            db.session.add(admin)
            print("[+] Usuario Admin creado.")
        else:
            print("[!] El usuario Admin ya existía.")

        # 3. Crear Usuario CONSULTA
        viewer = Usuario.query.filter_by(email="viewer@test.com").first()
        if not viewer:
            viewer = Usuario(
                email="viewer@test.com",
                clave=clave_hash,
                rol="consulta",
                activo=True
            )
            db.session.add(viewer)
            print("[+] Usuario Consulta creado.")
        else:
            print("[!] El usuario Consulta ya existía.")

        # 4. Guardar cambios
        try:
            db.session.commit()
            print("--- ¡Usuarios creados exitosamente! ---")
        except Exception as e:
            db.session.rollback()
            print(f"--- Error al guardar: {e} ---")

if __name__ == '__main__':
    crear_usuarios_prueba()