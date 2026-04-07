from database import db
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship, validates
import re

class Grupo(db.Model):
    __tablename__ = 'grupo'
    
    id = Column(Integer, primary_key=True)
    institucionId = Column(Integer, ForeignKey('institucion.id'), nullable = False)
    sigla = Column(String, nullable=False)
    nombre = Column(String, nullable=False)
    objetivos = Column(Text, nullable=False)
    organigrama = Column(String, nullable=False)
    correo_electronico = Column(String, nullable=False)
    director = Column(String, nullable=False)
    vicedirector = Column(String, nullable=False)
    consejo_ejecutivo = Column(String)
    activo = Column(Boolean, nullable=False)

    planificaciones = relationship('Planificacion', back_populates='grupo')
    institucion = relationship('Institucion', back_populates='grupo')

    def to_dict(self):
        return {
            'id': self.id,
            'sigla': self.sigla,
            'nombre': self.nombre,
            'objetivos': self.objetivos,
            'organigrama': self.organigrama,
            'correo_electronico': self.correo_electronico,
            'director': self.director,
            'vicedirector': self.vicedirector,
            'consejo_ejecutivo': self.consejo_ejecutivo,
            'activo': self.activo,
            'institucionId': self.institucionId,

            'institucionNombre': self.institucion.nombre if self.institucion else "No encontrada"
        }

    @validates('correo_electronico')
    def validar_correo(self, nombre_columna, correo):
        if not correo:
            raise ValueError("El correo electrónico es obligatorio.")
        
        patron = r'^[\w\.-]+@[\w\.-]+\.\w+$'
        if not re.match(patron, correo):
            raise ValueError(f"El formato de correo '{correo}' es inválido.")
        return correo.lower()
    
    @validates('sigla', 'nombre')
    def validar_textos(self, nombre_columna, valor):
        if not valor or len(valor.strip()) == 0:
            raise ValueError(f"El campo {nombre_columna} no puede estar vacío.")
        return valor.strip()