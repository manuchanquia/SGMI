from models.enumerativas import (
    TipoPersonal, 
    RolSoporte, 
    RolVisitante, 
    TipoFormacion, 
    DedicacionInvestigador,
    TipoDocumento
)

class AdminEnumerativas:
    
    def obtener_todas_las_opciones(self):
        
        return {
            "tipos_personal": [t.value for t in TipoPersonal],
            "roles_soporte": [r.value for r in RolSoporte],
            "roles_visitante": [r.value for r in RolVisitante],
            "tipos_formacion": [f.value for f in TipoFormacion],
            "dedicaciones": [d.value for d in DedicacionInvestigador],
            "tipos_documento": [td.value for td in TipoDocumento]
        }