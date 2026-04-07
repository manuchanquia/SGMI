from models.usuario import Usuario
from database import db
import bcrypt
from models.persona import Persona

class AdminLogin:
    def verificar_credenciales(self, email, clavePlana):
        usuario = Usuario.query.filter_by(email=email, activo=True).first()
        if usuario:
            hash_db = usuario.clave
            if isinstance(hash_db, str):
                hash_db = hash_db.encode('utf-8')
            
            hash_limpio = hash_db.rstrip(b'\x00')
        
            if bcrypt.checkpw(clavePlana.encode('utf-8'), hash_limpio):
                return usuario.to_dict()
        return None
    
    def obtener_todos_usuarios(self):
        return Usuario.query

    def obtener_un_usuario(self, id):
        return Usuario.query.get(id)
    
    def crear_nuevo_usuario(self, datos):
        email = datos.get('email')
        id_persona = datos.get('id_persona')

        if Usuario.query.filter_by(email=email).first():
            raise ValueError(f"El email {email} ya está registrado.")
        
        if id_persona:
            if not Persona.query.get(id_persona):
                raise ValueError(f"La Persona con ID {id_persona} no existe.")
            
        try:
            nueva_clave = bcrypt.hashpw(datos.get('clave').encode('utf-8'), bcrypt.gensalt())
            
            nuevo_usuario = Usuario(
                email=email,
                clave=nueva_clave,
                rol=datos.get('rol'),
                id_persona=id_persona
            )

            db.session.add(nuevo_usuario)
            db.session.commit()
            return True
                
        except Exception as error:
            db.session.rollback()
            raise error
        
    def modificar_usuario(self, id_usuario, datos):
        try:
            usuario = Usuario.query.get(id_usuario)
            if not usuario:
                return False

            nuevo_email = datos.get('email')
            if nuevo_email and nuevo_email != usuario.email:
                if Usuario.query.filter_by(email=nuevo_email).first():
                    raise ValueError(f"El email {nuevo_email} ya está en uso.")
                usuario.email = nuevo_email

            nuevo_id_persona = datos.get('id_persona')
            if nuevo_id_persona:
                if not Persona.query.get(nuevo_id_persona):
                    raise ValueError(f"La Persona con ID {nuevo_id_persona} no existe.")
                usuario.id_persona = nuevo_id_persona
            elif 'id_persona' in datos:
                usuario.id_persona = None                

            usuario.rol = datos.get('rol', usuario.rol)
            usuario.activo = datos.get('activo', usuario.activo)

            nueva_clave = datos.get('clave')
            if nueva_clave and nueva_clave.strip() != "":
                usuario.clave = bcrypt.hashpw(nueva_clave.encode('utf-8'), bcrypt.gensalt())

            db.session.commit()
            return True
        except Exception as error:
            db.session.rollback()
            raise error