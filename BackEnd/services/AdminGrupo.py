from flask.views import MethodView

#MODELOS
from database import db
from models.grupo import Grupo
from models.institucion import Institucion
from models.planificacion import Planificacion
from models.personal import Personal


class AdminGrupo(MethodView):

    def obtenerUnGrupo(self, id):
        return Grupo.query.filter_by(id = id).first()

    def obtenerTodosGrupos(self, rol='superadmin', id_persona=None):
        consulta = Grupo.query.join(Institucion)
        if rol != 'superadmin' and id_persona is not None:
            consulta = consulta.join(Planificacion).join(Personal).filter(
                Personal.personaId == id_persona
            ).distinct()
        return consulta
    
    def obtenerInstitucionDeGrupo(self, institucionId):
        return Grupo.query.filter_by(institucionId = institucionId)

    def crearGrupo(self, grupo):
        id_inst = grupo.get('institucionId')
        if not id_inst:
            raise ValueError("El ID de la institución es obligatorio.")
            
        institucion = Institucion.query.get(id_inst)
        if not institucion:
            raise ValueError(f"No se puede crear el grupo: La institución con ID {id_inst} no existe.")
        
        try:
            nuevoGrupo = Grupo(
                sigla = grupo.get('sigla'),
                nombre = grupo.get('nombre'),
                objetivos = grupo.get('objetivos'),
                organigrama = grupo.get('organigrama'),
                correo_electronico = grupo.get('correo_electronico'),
                director = grupo.get('director'),
                vicedirector = grupo.get('vicedirector'),
                consejo_ejecutivo = grupo.get('consejo_ejecutivo'),
                institucionId = grupo.get('institucionId'),
                activo = grupo.get('activo')if grupo.get('activo') is not None else True
            )

            db.session.add(nuevoGrupo)
            db.session.commit()

            return nuevoGrupo
        
        except Exception as excepcion:
                db.session.rollback()
                raise excepcion
        
    
    def modificarGrupo(self, data, idGrupo):
        try:
            grupoSeleccionado = self.obtenerUnGrupo(idGrupo)
            if not grupoSeleccionado:
                return None
            
            if 'institucionId' in data:
                inst = Institucion.query.get(data['institucionId'])
                if not inst:
                    raise ValueError("La nueva institución especificada no existe.")
                
            se_esta_desactivando = data.get('activo') is False and grupoSeleccionado.activo is True

            camposPermitidos = ['sigla', 'nombre', 'objetivos', 'organigrama', 'correo_electronico', 'director', 'vicedirector', 'consejo_ejecutivo', 'institucionId', 'activo']

            for campo in camposPermitidos:
                if campo in data:
                    setattr(grupoSeleccionado, campo, data[campo])

            if se_esta_desactivando:
                Planificacion.query.filter_by(grupoId=idGrupo).update({"activa": False})
                print(f"Grupo {idGrupo} desactivado. Planificaciones congeladas automáticamente.")

            db.session.commit()
            return grupoSeleccionado
    
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion

        
    def eliminarGrupo(self, idGrupo):
        try:
            grupoSeleccionado = self.obtenerUnGrupo(idGrupo)
            if not grupoSeleccionado:
                return None
        
            planificaciones = Planificacion.query.filter_by(grupoId=idGrupo).first()
            if planificaciones:
                raise ValueError("No se puede eliminar el grupo porque tiene planificaciones asociadas.")
            
            db.session.delete(grupoSeleccionado)
            db.session.commit()
            
            return True
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion