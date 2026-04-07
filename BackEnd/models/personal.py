from database import db
from .enumerativas import TipoPersonal, TipoFormacion, DedicacionInvestigador, RolSoporte, RolVisitante
from datetime import datetime, date
from sqlalchemy.orm import validates

class Personal(db.Model):
    __tablename__ = 'personal'

    id = db.Column(db.Integer, primary_key = True)
    horas = db.Column(db.Integer, nullable = False)
    fechaInicio = db.Column(db.Date, nullable = False)
    fechaFin = db.Column(db.Date, nullable = True)

    # FK
    planificacionId = db.Column('planificacionId', db.Integer, db.ForeignKey('planificacion.id'))
    personaId = db.Column('personaId', db.Integer, db.ForeignKey('persona.id'))

    #Relaciones
    persona = db.relationship('Persona', backref='personal')
    planificacion_ref = db.relationship('Planificacion', back_populates = 'personal')

    #OBJ Type
    objectType = db.Column('objectType', db.String(50))
    
    #Becario
    financiamiento = db.Column(db.String(100), nullable = True)
    formacionBecario = db.Column('formacionBecario', db.Enum(TipoFormacion, values_callable=lambda x: [item.value for item in x]), nullable = True)
    
    #Investigador
    categoria = db.Column(db.String(50), nullable = True)
    incentivo = db.Column(db.String(50), nullable = True)
    dedicacion = db.Column(db.Enum(DedicacionInvestigador, values_callable=lambda x: [item.value for item in x]), nullable = True)
    
    #Profesional no tiene mas atributos que horas dedicadas

    #Soporte o Visitante
    rol = db.Column('rol', db.String(50), nullable = True)

    __mapper_args__ = {
        'polymorphic_identity':'personal',
        'polymorphic_on':objectType
    }

    def to_dict(self):
        datos_persona = self.persona.to_dict() if self.persona else {}
        return {
            'id': self.id,
            'horas': self.horas,
            'personaId': self.personaId,
            'planificacionId': self.planificacionId,
            'objectType': self.objectType,
            'fechaInicio': self.fechaInicio.isoformat() if self.fechaInicio else None,
            'fechaFin': self.fechaFin.isoformat() if self.fechaFin else None,

            #persona
            'nombre': datos_persona.get('nombre', 'Desconocido'),
            'apellido': datos_persona.get('apellido', 'Desconocido'),
            'activo': datos_persona.get('activo', False),
            'nacionalidad': datos_persona.get('nacionalidad', ''),
            'tipoDocumento': datos_persona.get('tipoDocumento', ''),
            'numeroDocumento': datos_persona.get('numeroDocumento', '')
        }
    
    @validates('horas')
    def validar_horas(self, nombre_columna, valor):
        if valor is not None and valor < 0:
            raise ValueError("Las horas dedicadas no pueden ser negativas.")
        return valor

    @validates('fechaInicio', 'fechaFin')
    def validar_fechas(self, nombre_columna, valor):
        if valor is None or valor == "":
            return None
        
        try:
            fecha_actual = valor
            if isinstance(valor, str):
                fecha_actual = datetime.strptime(valor, '%Y-%m-%d').date()
            
            if nombre_columna == 'fechaFin':
                inicio = self.fechaInicio
                if inicio:
                    if isinstance(inicio, str):
                        inicio = datetime.strptime(inicio, '%Y-%m-%d').date()
                    
                    if hasattr(inicio, 'date') and not isinstance(inicio, date):
                        inicio = inicio.date()

                    if fecha_actual < inicio:
                        raise ValueError("La fecha de fin no puede ser anterior a la de inicio.")
            
            return fecha_actual

        except (TypeError, ValueError) as e:
            if "fecha de fin" in str(e):
                raise e
            raise ValueError(f"Error de formato o tipo en el campo {nombre_columna}: {str(e)}")

    
class Becario(Personal):
    __mapper_args__ = {
        'polymorphic_identity': TipoPersonal.BECARIO.value
    }
    
    def to_dict(self):
        data = super().to_dict()
        data['financiamiento'] = self.financiamiento
        data['formacionBecario'] = self.formacionBecario.value if self.formacionBecario else None
        return data


class Investigador(Personal):
    __mapper_args__ = {
        'polymorphic_identity': TipoPersonal.INVESTIGADOR.value
    }

    def to_dict(self):
        data = super().to_dict()
        data['categoria'] = self.categoria
        data['incentivo'] = self.incentivo
        data['dedicacion'] = self.dedicacion.value if self.dedicacion else None
        return data


class Profesional(Personal):
    __mapper_args__ = {
        'polymorphic_identity': TipoPersonal.PROFESIONAL.value
    }

class Soporte(Personal):
    __mapper_args__ = {
        'polymorphic_identity': TipoPersonal.SOPORTE.value
    }
    
    @property
    def rolSoporte(self):
        if self.rol:
            return RolSoporte(self.rol)
        return None
    
    @rolSoporte.setter
    def rolSoporte(self, value):
        if isinstance(value, RolSoporte):
            self.rol = value.value
        else:
            raise ValueError("Debe asignar un rol de soporte válido")

    def to_dict(self):
        data = super().to_dict()
        data['rol'] = self.rolSoporte.value if self.rolSoporte else None
        return data


class Visitante(Personal):
    __mapper_args__ = {
        'polymorphic_identity': TipoPersonal.VISITANTE.value
    }
    
    @property
    def rolVisitante(self):
        if self.rol:
            return RolVisitante(self.rol)
        return None
    
    @rolVisitante.setter
    def rolVisitante(self, value):
        if isinstance(value, RolVisitante):
            self.rol = value.value
        else:
            raise ValueError("Debe asignar un rol de visitante válido")
    
    def to_dict(self):
        data = super().to_dict()
        data['rol'] = self.rolVisitante.value if self.rolVisitante else None
        return data



