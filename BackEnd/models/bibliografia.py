from database import db
from sqlalchemy import Column, Integer, String, Date, ForeignKey, Boolean
from sqlalchemy.orm import relationship, validates
from datetime import datetime

class Bibliografia(db.Model):
    __tablename__ = 'bibliografia'
    
    id = Column(Integer, primary_key=True)
    titulo = Column(String, nullable=False)
    autores = Column(String, nullable=False)
    editorial = Column(String, nullable=False)
    fecha = Column(Date, nullable=False)
    planificacionId = Column(Integer, ForeignKey('planificacion.id'), nullable=False)
    anio = Column(Integer, nullable=True)
    activo = Column(Boolean, nullable=False)

    #relaciones
    planificacion_ref = relationship('Planificacion', back_populates='bibliografias')


    def to_dict(self):
        return {
            'id': self.id,
            'titulo': self.titulo,
            'autores': self.autores,
            'editorial': self.editorial,
            'fecha': str(self.fecha) if self.fecha else None,
            'planificacionId': self.planificacionId,
            'anio': self.anio,
            'activo': self.activo
        }
    
    @validates('anio')
    def validar_anio(self, nombre_columna, valor):
        if valor is not None:
            anio_actual = datetime.now().year
            if valor < 1500 or valor > anio_actual + 5:
                raise ValueError(f"El anio ${valor} es invalido.")
        return valor
    
    @validates('fecha')
    def validar_fecha(self, nombre_columna, valor):
        if isinstance(valor, str):
            try:
                valor_dt = datetime.strptime(valor, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError("Formato de fecha invalido. Use AAAA-MM-DD")
        else:
            valor_dt = valor

        if valor_dt and valor_dt > datetime.now().date():
            raise ValueError("La fecha de publicacion no puede ser en el futuro.")
        return valor
