from database import db
from models.personal import Personal, Investigador, Profesional, Becario, Soporte, Visitante
from models.enumerativas import RolSoporte, TipoFormacion, RolVisitante, DedicacionInvestigador, TipoPersonal
from sqlalchemy.orm import joinedload
from datetime import datetime

from services.AdminPersona import AdminPersona
from models.persona import Persona
from models.planificacion import Planificacion
from models.grupo import Grupo

administradorPersona = AdminPersona()

class AdminPersonal:

    def obtenerUnPersonal(self, id):
        return Personal.query.filter_by(id = id).first()
    
    def obtenerTodoPersonal(self, rol='superadmin', id_persona=None):
        consulta = Personal.query

        if rol != 'superadmin' and id_persona is not None:
            grupos_usuario = db.session.query(Planificacion.grupoId).join(Personal).filter(Personal.personaId == id_persona).subquery()
            
            consulta = consulta.join(Planificacion).filter(
                Planificacion.grupoId.in_(grupos_usuario)
            ).distinct()
            
        return consulta
    
    def obtenerPersonalDePlanificacion(self, planificacionId, rol='superadmin', id_persona=None):
        consulta = Personal.query.filter_by(planificacionId = planificacionId)

        if rol != 'superadmin' and id_persona is not None:
            grupos_usuario = db.session.query(Planificacion.grupoId).join(Personal).filter(Personal.personaId == id_persona).subquery()
            
            consulta = consulta.join(Planificacion).filter(
                Planificacion.grupoId.in_(grupos_usuario)
            ).distinct()
            
        return consulta
    
    def obtenerPersonalParaExcel(self, planificacionId):
        return (
            Personal.query
            .options(joinedload(Personal.persona))
            .filter(Personal.planificacionId == planificacionId)
            .all()
        )
    
    def modificarPersonal(self, data, idPersonal):
        try:
            personalSeleccionado = self.obtenerUnPersonal(idPersonal)

            if not personalSeleccionado:
                raise ValueError('Personal no encontrado')

            tipo_actual = personalSeleccionado.objectType
            tipo_nuevo = data.get('objectType')

            if tipo_nuevo and tipo_nuevo != tipo_actual:

                persona_id = personalSeleccionado.personaId
                plan_id = personalSeleccionado.planificacionId

                db.session.delete(personalSeleccionado)
                db.session.flush()

                mapa_operacion = {
                    TipoPersonal.PROFESIONAL.value: 1,
                    TipoPersonal.SOPORTE.value: 2,
                    TipoPersonal.BECARIO.value: 3,
                    TipoPersonal.VISITANTE.value: 4,
                    TipoPersonal.INVESTIGADOR.value: 5
                }

                if tipo_nuevo not in mapa_operacion:
                    raise ValueError("Tipo de personal inválido")

                data['personaId'] = persona_id
                data['planificacionId'] = plan_id

                nuevo = self.crearPersonal(data, mapa_operacion[tipo_nuevo])
                return nuevo

            tipoPersonal = tipo_actual

            if 'horas' in data:
                personalSeleccionado.horas = data['horas']

            if 'fechaInicio' in data:
                personalSeleccionado.fechaInicio = data['fechaInicio']

            if 'fechaFin' in data:
                personalSeleccionado.fechaFin = data['fechaFin']

            # BECARIO
            if tipoPersonal == TipoPersonal.BECARIO.value:
                if 'formacionBecario' in data:
                    personalSeleccionado.formacionBecario = TipoFormacion(data['formacionBecario'])
                if 'financiamiento' in data:
                    personalSeleccionado.financiamiento = data['financiamiento']

            # SOPORTE
            elif tipoPersonal == TipoPersonal.SOPORTE.value:
                if 'rol' in data:
                    personalSeleccionado.rolSoporte = RolSoporte(data['rol'])

            # VISITANTE
            elif tipoPersonal == TipoPersonal.VISITANTE.value:
                if 'rol' in data:
                    personalSeleccionado.rolVisitante = RolVisitante(data['rol'])

            # INVESTIGADOR
            elif tipoPersonal == TipoPersonal.INVESTIGADOR.value:
                if 'categoria' in data:
                    personalSeleccionado.categoria = data['categoria']
                if 'incentivo' in data:
                    personalSeleccionado.incentivo = data['incentivo']
                if 'dedicacion' in data:
                    personalSeleccionado.dedicacion = DedicacionInvestigador(data['dedicacion'])

            db.session.commit()
            return personalSeleccionado

        except Exception as excepcion:
            db.session.rollback()
            raise excepcion
    

    def crearPersonal(self, personal, operacion):

        p_id = personal.get('personaId')
        plan_id = personal.get('planificacionId')

        if not Persona.query.get(p_id):
            raise ValueError(f"La Persona con ID {p_id} no existe.")
        if not Planificacion.query.get(plan_id):
            raise ValueError(f"La Planificación con ID {plan_id} no existe.")

        try: 
            #PROFESIONAL    
            if operacion == 1:
                nuevo = Profesional(**self._extraer_comunes(personal))
                #JSON PARA CREAR UN PROFESIONAL
                #{
                #  "horas": 20,
                #  "planificacionId": 1,
                #  "personaId": 1
                #  "fechaInicio": 2026-02-10
                #  "fechaFin": null
                #}

            #SOPORTE
            elif operacion == 2:
            
                rolpersonal = personal.get('rol')
                if rolpersonal not in [rol.value for rol in RolSoporte]:
                    raise ValueError("Rol de soporte invalido. Opciones: {[r.value for r in RolSoporte]")
                nuevo = Soporte(**self._extraer_comunes(personal), 
                                rol=rolpersonal)
                #JSON PARA CREAR UN SOPORTE
                #{
                #  "rolSoporte": "tecnico",
                #  "horas": 20,
                #  "planificacionId": 1,
                #  "personaId": 2
                #  "fechaInicio": 2026-02-10
                #  "fechaFin": null
                #}

            #BECARIO
            elif operacion == 3:
                formacionBecario = personal.get('formacionBecario')

                if formacionBecario not in [tipo.value for tipo in TipoFormacion]:
                    raise ValueError("Tipo de formacion de becario invalido")
                nuevo = Becario(**self._extraer_comunes(personal), 
                                formacionBecario=formacionBecario, 
                                financiamiento=personal.get('financiamiento'))
                #JSON PARA CREAR UN BECARIO
                #{
                #  "formacion": "doctorado",
                #  "horas": 20,
                #  "planificacionId": 1,
                #  "personaId": 2
                #  "financiamiento": "rectorado UTN"
                #  "fechaInicio": 2026-02-10
                #  "fechaFin": null
                #}

            #VISITANTE
            elif operacion == 4:
                rolpersonal = personal.get('rol')
                if rolpersonal not in [rol.value for rol in RolVisitante]:
                    raise ValueError("Rol de visitante invalido")
                
                nuevo = Visitante(**self._extraer_comunes(personal), rol=rolpersonal)
                
                #JSON PARA CREAR UN VISITANTE
                #{
                #  "rol": "academica",
                #  "horas": 20,
                #  "planificacionId": 1,
                #  "personaId": 2
                #  "fechaInicio": 2026-02-10
                #  "fechaFin": null
                #}

            #INVESTIGADOR
            elif operacion == 5:
                dedicacion = personal.get('dedicacion')
                if dedicacion not in [d.value for d in DedicacionInvestigador]:
                    raise ValueError("Dedicación de investigador inválida.")
                nuevo = Investigador(**self._extraer_comunes(personal),
                                    categoria=personal.get('categoria'),
                                    incentivo=personal.get('incentivo'),
                                    dedicacion=dedicacion)
                
                #JSON PARA CREAR UN INVESTIGADOR
                #{
                #  "horas": 20,
                #  "planificacionId": 1,
                #  "personaId": 2,
                #  "categoria": "prueba",
                #  "incentivo": "prueba",
                #  "dedicacion": "prueba"
                #  "fechaInicio": 2026-02-10
                #  "fechaFin": null
                #}

            db.session.add(nuevo)
            db.session.commit()
            return nuevo
        except Exception as e:
            db.session.rollback()
            raise e

    def _extraer_comunes(self, data):
        f_inicio = data.get('fechaInicio')
        f_fin = data.get('fechaFin')

        def formatear(f):
            if not f or f == "": return None
            if isinstance(f, str):
                return datetime.strptime(f, '%Y-%m-%d').date()
            return f

        return {
            "planificacionId": data.get('planificacionId'),
            "personaId": data.get('personaId'),
            "horas": int(data.get('horas', 0)),
            "fechaInicio": formatear(f_inicio),
            "fechaFin": formatear(f_fin)
        }
    
    def eliminarPersonal(self, idPersonal):
        try:
            personalSeleccionado = Personal.query.options(joinedload(Personal.persona)).filter_by(id=idPersonal).first()
            
            if not personalSeleccionado:
                return None
            
            datos_personal = personalSeleccionado.to_dict()
            
            db.session.delete(personalSeleccionado)
            db.session.commit()
            
            return datos_personal
        
        except Exception as excepcion:
            db.session.rollback()
            raise excepcion