from datetime import date
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from flask.views import MethodView

#MODELOS
from database import db
from models.persona import Persona

class AdminPersona(MethodView):

    def obtenerTodasPersonas(self):
        return Persona.query
    
    def obtenerUnaPersona(self, id):
        return Persona.query.filter_by(id = id).first()
    
    def obtenerPersonaPorDocumento(self, numero):
        return Persona.query.filter_by(numeroDocumento = numero).first()
    
    def obtenerPersonasPorDocumentoParcial(self, numero):
        return Persona.query.filter(
            Persona.numeroDocumento.ilike(f"%{numero}%")
        ).all()
    
    def crearPersona(self, persona):
        requeridos = ['nombre', 'apellido', 'tipoDocumento', 'numeroDocumento', 'nacionalidad']
        for campo in requeridos:
            if not persona.get(campo):
                raise ValueError(f"El campo '{campo}' es obligatorio.")

        try:
            documento = persona.get('numeroDocumento')
            personaExistente = self.obtenerPersonaPorDocumento(documento)

            if personaExistente:
                raise ValueError(f"Ya existe una persona registrada con el documento {documento}.")
            
            nuevaPersona = Persona(
                nombre = persona.get('nombre'),
                apellido = persona.get('apellido'),
                tipoDocumento = persona.get('tipoDocumento'),
                numeroDocumento = persona.get('numeroDocumento'),
                nacionalidad = persona.get('nacionalidad'),
                activo = persona.get('activo')
            )

            db.session.add(nuevaPersona)
            db.session.commit()

            return nuevaPersona
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
        
    
    def modificarPersona(self, data, idPersona):

        try:
            personaSeleccionada = self.obtenerUnaPersona(idPersona)

            if not personaSeleccionada:
                return None
            
            if 'numeroDocumento' in data:
                nuevo_doc = str(data['numeroDocumento']).strip()
                existe = Persona.query.filter(Persona.numeroDocumento == nuevo_doc, Persona.id != idPersona).first()
                if existe:
                    raise ValueError(f"El documento {nuevo_doc} ya pertenece a otra persona.")
            
            camposPermitidos = ['nombre', 'apellido', 'tipoDocumento', 'numeroDocumento', 'nacionalidad', 'activo']

            for campo in camposPermitidos:
                if campo in data:
                    setattr(personaSeleccionada, campo, data[campo])

            db.session.commit()
            return personaSeleccionada
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
        