from database import db
from sqlalchemy.orm import validates
import re

class Usuario(db.Model):
    __tablename__ = 'usuario'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    clave = db.Column(db.LargeBinary, nullable=False)
    activo = db.Column(db.Boolean, default=True)
    rol = db.Column(db.String(20), default='consulta', nullable=False)

    id_persona = db.Column('idPersona', db.Integer, db.ForeignKey('persona.id'), nullable=True)
    persona = db.relationship('Persona', back_populates='usuario')

    def to_dict(self):
        datos_persona = self.persona.to_dict() if self.persona else {}
        return {
            'id': self.id,
            'email': self.email,
            'activo': self.activo,
            'rol': self.rol,
            'id_persona': self.id_persona,
            'nombre_persona': datos_persona.get('nombre') if datos_persona else None,
            'apellido_persona': datos_persona.get('apellido')if datos_persona else None
        }
    
    @validates('email')
    def validar_email(self, nombre_columna, direccion):
        if not direccion:
            raise ValueError("El email es obligatorio.")
        
        patron = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(patron, direccion):
            raise ValueError(f"El formato de email '{direccion}' no es válido.")
            
        return direccion.lower().strip()

    @validates('rol')
    def validar_rol(self, nombre_columna, valor_rol):
        roles_validos = ['admin', 'consulta', 'superadmin']
        if valor_rol not in roles_validos:
            raise ValueError(f"Rol inválido. Debe ser uno de: {', '.join(roles_validos)}")
        return valor_rol