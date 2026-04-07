from database import db
from sqlalchemy import Column, Text, BigInteger, Boolean
from sqlalchemy.orm import relationship, validates
from .enumerativas import TipoDocumento


class Persona(db.Model):
    __tablename__ = 'persona'
    
    id = Column(BigInteger, primary_key = True)
    nombre = Column(Text, nullable = False)
    apellido = Column(Text, nullable = False)
    tipoDocumento = Column('tipoDocumento', db.Enum(TipoDocumento, values_callable = lambda x: [item.value for item in x]), nullable = False)
    numeroDocumento = Column(Text, nullable = False)
    nacionalidad = Column(Text, nullable = False)
    activo = Column(Boolean, nullable = False)

    usuario = relationship('Usuario', back_populates='persona', uselist=False)

    def to_dict(self):
        return {
            'id': self.id,
            'nombre': self.nombre,
            'apellido': self.apellido,
            'tipoDocumento': self.tipoDocumento.value if self.tipoDocumento else None,
            'numeroDocumento': self.numeroDocumento,
            'nacionalidad': self.nacionalidad,
            'activo': self.activo
        }
    
    @validates('nombre', 'apellido', 'nacionalidad')
    def validar_textos(self, nombre_columna, texto):
        if not texto or len(texto.strip()) < 2:
            raise ValueError(f"El campo '{nombre_columna}' debe tener al menos 2 caracteres.")
        return texto.strip().title()

    @validates('numeroDocumento')
    def validar_documento(self, nombre_columna, numero):
        if not numero:
            raise ValueError("El número de documento es obligatorio.")
        
        limpio = str(numero).replace(" ", "").replace("-", "")
        
        if self.tipoDocumento == TipoDocumento.DNI and not limpio.isdigit():
            raise ValueError("El DNI debe contener solo números.")
            
        return limpio

    @validates('tipoDocumento')
    def validar_tipo_doc(self, nombre_columna, tipo):
        if isinstance(tipo, str):
            valores_validos = [item.value for item in TipoDocumento]
            if tipo not in valores_validos:
                raise ValueError(f"Tipo de documento inválido. Opciones: {', '.join(valores_validos)}")
        return tipo