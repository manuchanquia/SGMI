from reports.ExportacionExcel import ExportarExcel
from services.AdminBibliografia import AdminBibliografia
from services.AdminGrupo import AdminGrupo
from services.AdminEquipamiento import AdminEquipamiento
from services.AdminPersonal import AdminPersonal
from services.AdminPlanificacion import AdminPlanificacion
from services.AdminProyecto import AdminProyecto
from database import db 
from models.planificacion import Planificacion 

class AdminExcel:

    def __init__(self):
        self.adminGrupo = AdminGrupo()
        self.adminPlanificacion = AdminPlanificacion()
        self.adminProyecto = AdminProyecto()
        self.adminPersonal = AdminPersonal()
        self.adminBibliografia = AdminBibliografia()
        self.adminEquipamiento = AdminEquipamiento()

    def generarMemoria(self, idPlanificacion, anio):
        
        planificacion = db.session.get(Planificacion, idPlanificacion)

        if not planificacion:
            raise Exception(f"No existe la planificación con ID {idPlanificacion} en la base de datos.")

        id_grupo_relacionado = planificacion.grupoId
        grupo = self.adminGrupo.obtenerUnGrupo(id_grupo_relacionado)
        
        if hasattr(grupo, 'first'): 
            grupo = grupo.first()

        institucion = self.adminGrupo.obtenerInstitucionDeGrupo(id_grupo_relacionado)
        if hasattr(institucion, 'first'): 
            institucion = institucion.first()

        proyectos = self.adminProyecto.obtenerProyectosDePlanificacion(planificacion.id)
        personal = self.adminPersonal.obtenerPersonalParaExcel(planificacion.id)
        bibliografia = self.adminBibliografia.obtenerBibliografiaDePlanificacion(planificacion.id)
        equipamiento = self.adminEquipamiento.obtenerEquipamientoDePlanificacion(planificacion.id)

        datos = {
            "grupo": grupo,
            "planificacion": planificacion,
            "institucion": institucion,
            "proyectos": proyectos,
            "personal": personal,
            "bibliografia": bibliografia,
            "equipamiento": equipamiento
        }

        return datos