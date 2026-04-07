from database import db
from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship, validates


class Institucion(db.Model):
    __tablename__ = 'institucion'
    
    id = Column(Integer, primary_key = True)
    nombre = Column(Text, nullable = False)
    descripcion = Column(Text, nullable = False)
    pais = Column(String)

    grupo = relationship('Grupo', back_populates='institucion')

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'pais': self.pais,
            'descripcion': self.descripcion,
        }
    
    @validates('nombre')
    def validar_nombre(self, nombre_columna, texto):
        if not texto or len(texto.strip()) < 3:
            raise ValueError("El nombre de la institución debe tener al menos 3 caracteres.")
        return texto.strip()
        
    @validates('pais')
    def validar_pais(self, nombre_columna, texto):
        if not texto or len(texto.strip()) == 0:
            raise ValueError("El campo 'pais' no puede estar vacío.")
        return texto.strip().capitalize()

    @validates('descripcion')
    def validar_descripcion(self, nombre_columna, texto):
        if not texto or len(texto.strip()) < 10:
            raise ValueError("La descripción debe ser mínimo de 10 caracteres.")
        return texto.strip()

