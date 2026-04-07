from database import db
from sqlalchemy import Column, Integer, String, Text, Date, ForeignKey, BigInteger, Float, Boolean
from sqlalchemy.orm import relationship, validates
from datetime import datetime, date


class Equipamiento(db.Model):
    __tablename__ = 'equipamiento'
    
    id = Column(BigInteger, primary_key=True)
    denominacion = Column(String, nullable=False)
    fechaIngreso = Column(Date, nullable=False)
    monto = Column(Float, nullable=False)
    descripcion = Column(Text)
    planificacionId = Column(Integer, ForeignKey('planificacion.id'), nullable=False)
    actividad = Column(Text, nullable = True)
    activo = Column(Boolean, nullable=False)
    
    planificacion_ref = relationship('Planificacion', back_populates='equipamientos')

    def to_dict(self):
        return {
            'id': self.id,
            'denominacion': self.denominacion,
            'fechaIngreso': str(self.fechaIngreso) if self.fechaIngreso else None,
            'monto': self.monto,
            'descripcion': self.descripcion,
            'planificacionId': self.planificacionId,
            'actividad': self.actividad,
            'activo': self.activo
        }
    
    @validates('monto')
    def validar_monto(self, nombre_columna, valor):
        if valor is not None and valor < 0:
            raise ValueError ("El monto del equipamiento no puede ser negativo.")
        return valor
    
    @validates('denominacion')
    def validar_denominacion(self, nombre_columna, texto):
        if not texto or len(texto.strip()) == 0:
            raise ValueError("La denominacion es obligatoria y no puede estar vacia.")
        return texto
    
    @validates('fechaIngreso')
    def validar_fecha(self, nombre_columna, valor):
        if isinstance(valor, str):
            valor_dt = datetime.strptime(valor, '%Y-%m-%d').date()
        else:
            valor_dt = valor
        
        if valor_dt and valor_dt > date.today():
            raise ValueError("La fecha de ingreso no puede ser futura.")
        return valor