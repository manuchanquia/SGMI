from flask.views import MethodView

#MODELOS
from database import db
from models.institucion import Institucion

class AdminInstitucion(MethodView):
    
    def obtenerUnaInstitucion(self, id):
        return Institucion.query.filter_by(id = id).first()
    
    def obtenerTodasInstituciones(self):
        return Institucion.query
    
    def crearInstitucion(self, institucion):
        requeridos = ['nombre', 'pais', 'descripcion']
        for campo in requeridos:
            if campo not in institucion or not institucion[campo]:
                raise ValueError(f"El campo '{campo}' es obligatorio.")
        try:
            nuevaInstitucion = Institucion(
                nombre = institucion.get('nombre'),
                pais = institucion.get('pais'),
                descripcion = institucion.get('descripcion')
            )
            db.session.add(nuevaInstitucion)
            db.session.commit()
            return nuevaInstitucion
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
    
    def modificarInstitucion(self, data, idInstitucion):
        try: 
            institucionSeleccionada = self.obtenerUnaInstitucion(idInstitucion)
        
            if not institucionSeleccionada:
                return None
            
            camposPermitidos = ['nombre', 'pais', 'descripcion']
            
            for campo in camposPermitidos:
                if campo in data:
                    setattr(institucionSeleccionada, campo, data[campo])
                    
            db.session.commit()
            return institucionSeleccionada
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
    
    def eliminarInstitucion(self, idInstitucion):
        try:
            institucionSeleccionada = self.obtenerUnaInstitucion(idInstitucion)
            if not institucionSeleccionada:
                return None
            
            db.session.delete(institucionSeleccionada)
            db.session.commit()
            
            return institucionSeleccionada
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion