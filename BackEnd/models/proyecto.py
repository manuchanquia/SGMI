from database import db
from sqlalchemy.orm import relationship, validates
from datetime import datetime
from sqlalchemy import Boolean

class Proyecto(db.Model):
    __tablename__ = 'proyecto'

    id = db.Column(db.Integer, primary_key = True)

    codigo = db.Column(db.String(50), unique = True, nullable = False)
    nombre = db.Column(db.String(100), nullable = False)
    descripcion = db.Column(db.Text, nullable = True)
    tipo = db.Column(db.String(50), nullable = False)
    logros = db.Column(db.Text, nullable = True)
    dificultades = db.Column(db.Text, nullable = True)
    fechaInicio = db.Column('fecha_inicio', db.Date, nullable = False)
    fechaFin = db.Column('fecha_fin', db.Date, nullable = True)
    financiamiento = db.Column(db.String(200), nullable = False)
    activo = db.Column(Boolean, nullable=False)
    planificacionId = db.Column('planificacionId', db.Integer, db.ForeignKey('planificacion.id'))

    # Relationships
    planificacion_ref = relationship('Planificacion', back_populates='proyectos')

    def to_dict(self):
        return {
            'id': self.id,
            'codigo': self.codigo,
            'nombre': self.nombre,
            'descripcion': self.descripcion,
            'tipo': self.tipo,
            'logros': self.logros,
            'dificultades': self.dificultades,
            'fechaInicio': self.fechaInicio.isoformat() if self.fechaInicio else None,
            'fechaFin': self.fechaFin.isoformat() if self.fechaFin else None,
            'financiamiento': self.financiamiento,
            'activo': self.activo,
            'planificiacionId': self.planificacionId
        }
    
    @validates('nombre', 'codigo')
    def validar_textos(self, nombre_columna, valor):
        if not valor or len(valor.strip()) == 0:
            raise ValueError(f"El campo {nombre_columna} no puede estar vacío.")
        return valor.strip()

    @validates('fechaInicio', 'fechaFin')
    def validar_fechas(self, nombre_columna, valor):
        fecha_evaluada = valor
        if isinstance(valor, str):
            try:
                fecha_evaluada = datetime.strptime(valor, '%Y-%m-%d').date()
            except ValueError:
                raise ValueError("Formato de fecha inválido. Use AAAA-MM-DD")

        if nombre_columna == 'fechaFin' and fecha_evaluada:
            inicio = self.fechaInicio
            if inicio:
                if isinstance(inicio, str):
                    inicio = datetime.strptime(inicio, '%Y-%m-%d').date()
                
                if fecha_evaluada < inicio:
                    raise ValueError("La fecha de fin del proyecto no puede ser anterior a la de inicio.")
        
        return fecha_evaluada