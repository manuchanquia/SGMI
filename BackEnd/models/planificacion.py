from database import db
from sqlalchemy import Column, Integer, Boolean
from sqlalchemy.orm import relationship, validates
from datetime import datetime, date
from sqlalchemy import Column, Integer, Boolean, Date
from sqlalchemy.orm import relationship


class Planificacion(db.Model):
    __tablename__ = 'planificacion'

    id = Column(Integer, primary_key = True)
    grupoId = Column(Integer, db.ForeignKey('grupo.id'), nullable = False)
    anio = Column(Date, nullable = False)
    activa = Column(Boolean, nullable = True)

    #RELACIONES
    personal = relationship('Personal', back_populates='planificacion_ref')
    proyectos = relationship('Proyecto', back_populates='planificacion_ref')
    equipamientos = relationship('Equipamiento', back_populates='planificacion_ref')
    bibliografias = relationship('Bibliografia', back_populates='planificacion_ref')
    grupo = relationship('Grupo', back_populates='planificaciones')

    def to_dict(self):
        return {
            'id': self.id,
            'grupoId': self.grupoId,
            'anio': self.anio.year if hasattr(self.anio, 'year') else int(str(self.anio)[:4]),
            'activa': self.activa
        }
    @validates('anio')
    def validar_anio(self, nombre_columna, valor):
        if valor is None:
            raise ValueError("El año es obligatorio.")

        if hasattr(valor, 'year'):
            anio_a_validar = valor.year
        else:
            anio_a_validar = int(str(valor)[:4])
        
        anio_actual = datetime.now().year
        
        if anio_a_validar < (anio_actual - 20) or anio_a_validar > (anio_actual + 2):
            raise ValueError(f"El anio {anio_a_validar} no es valido para una planificacion.")
            
        return valor