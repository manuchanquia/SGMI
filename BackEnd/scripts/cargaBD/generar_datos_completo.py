"""
Script para generar datos de prueba COMPLETOS desde cero
Genera un grupo de investigación con proyectos 2023-2026
"""
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

import random
from datetime import date, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Configuración base de datos
DATABASE_URI = 'postgresql://postgres.hxrdfvfeiddvydvilrsa:Segundo_Francia_2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres'

# Create engine and session
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(bind=engine)

# Import models
from models.grupo import Grupo
from models.proyecto import Proyecto
from models.equipamiento import Equipamiento
from models.bibliografia import Bibliografia
from models.gradoAcademico import GradoAcademico
from models.actividadDocente import ActividadDocente
from models.personal import Personal, Becario, Investigador, Profesional, Soporte, Visitante
from models.personaGrupo import PersonaGrupo
from models.models_db import (
    Participacion, ParticipacionPersona, Institucion, 
    Distincion, Documentacion, LoginCredentials,
    Revista, Articulo, Libro,
    ProyectoLibro, ProyectoRevista, ProyectoArticulo,
    Contrato, Erogacion
)

def limpiar_datos(session):
    """Elimina todos los datos existentes"""
    print("🗑️  Limpiando datos existentes...")
    try:
        # Eliminar en orden inverso por dependencias
        session.query(ProyectoArticulo).delete()
        session.query(ProyectoRevista).delete()
        session.query(ProyectoLibro).delete()
        session.query(ParticipacionPersona).delete()
        session.query(Participacion).delete()
        session.query(ActividadDocente).delete()
        session.query(Distincion).delete()
        session.query(Erogacion).delete()
        session.query(Bibliografia).delete()
        session.query(Equipamiento).delete()
        session.query(Proyecto).delete()
        session.query(Grupo).delete()
        session.query(Articulo).delete()
        session.query(Revista).delete()
        session.query(Libro).delete()
        session.query(Documentacion).delete()
        session.query(Contrato).delete()
        session.query(Institucion).delete()
        session.commit()
        print("  ✓ Datos eliminados exitosamente")
    except Exception as e:
        session.rollback()
        print(f"  ⚠️  Error al limpiar datos: {e}")

def crear_instituciones(session):
    """Crea instituciones base"""
    print("\n📚 Creando instituciones...")
    
    instituciones_data = [
        {"descripcion": "Ministerio del Interior", "pais": "Argentina"},
        {"descripcion": "Gobierno de Córdoba", "pais": "Argentina"},
        {"descripcion": "Municipalidad de Córdoba", "pais": "Argentina"},
        {"descripcion": "CONICET", "pais": "Argentina"},
        {"descripcion": "Universidad Nacional de Córdoba", "pais": "Argentina"},
        {"descripcion": "Ministerio de Modernización", "pais": "Argentina"},
        {"descripcion": "ANSES", "pais": "Argentina"},
        {"descripcion": "AFIP", "pais": "Argentina"},
    ]
    
    instituciones = []
    for inst_data in instituciones_data:
        inst = Institucion(
            descripcion=inst_data["descripcion"],
            pais=inst_data["pais"]
        )
        session.add(inst)
        instituciones.append(inst)
    
    session.flush()
    print(f"  ✓ {len(instituciones)} instituciones creadas")
    return instituciones

def crear_grupo(session):
    """Crea el grupo de investigación"""
    print("\n🏢 Creando grupo de investigación...")
    
    grupo = Grupo(
        sigla="GIDAG",
        nombre="Grupo de Investigación y Desarrollo de Aplicaciones Gubernamentales",
        objetivos="Desarrollar soluciones tecnológicas innovadoras para la modernización "
                  "de la gestión pública en los ámbitos nacional, provincial y municipal. "
                  "Investigar y aplicar tecnologías emergentes en e-government, "
                  "inteligencia artificial aplicada a servicios públicos, y transformación digital.",
        organigrama="Director - Subdirector - Investigadores Senior - Investigadores Junior - "
                   "Becarios - Personal de Apoyo - Colaboradores Externos",
        correoElectronico="gidag@unc.edu.ar",
        director="Dr. Juan Pérez",
        vicedirector="Dra. María González",
        consejo_ejecutivo="Dr. Juan Pérez (Director), Dra. María González (Subdirectora), "
                         "Ing. Carlos Rodríguez, Lic. Ana Martínez",
        unidad_academica="Facultad de Ingeniería - Departamento de Computación"
    )
    session.add(grupo)
    session.flush()
    print(f"  ✓ Grupo creado: {grupo.nombre} (ID: {grupo.id})")
    return grupo

def crear_proyectos(session, grupo_id, year):
    """Crea proyectos para un año específico"""
    
    temas_proyectos = [
        ("Sistema de Gestión Tributaria Municipal", "Desarrollo de plataforma integral para gestión de impuestos municipales"),
        ("Plataforma de Trámites Online Provinciales", "Sistema web para digitalización de trámites administrativos"),
        ("Portal de Transparencia Gubernamental", "Portal de acceso a información pública y rendición de cuentas"),
        ("Sistema de Firma Digital para Entes Públicos", "Infraestructura de firma electrónica avanzada"),
        ("Aplicación Móvil de Atención Ciudadana", "App móvil multiplataforma para servicios al ciudadano"),
        ("Sistema de Gestión de Expedientes Electrónicos", "Sistema de gestión documental electrónica (GDE)"),
        ("Plataforma de Participación Ciudadana", "Herramienta digital para consultas y presupuesto participativo"),
        ("Sistema de Gestión de Recursos Humanos Públicos", "Sistema integral de RRHH para administración pública"),
        ("Portal de Datos Abiertos Gubernamentales", "Plataforma de publicación y acceso a datos abiertos"),
        ("Sistema de Monitoreo de Obras Públicas", "Sistema de seguimiento y control de obras con geolocalización"),
        ("Sistema de Turnos Online para Oficinas Públicas", "Gestión de turnos y atención al público"),
        ("Plataforma de Educación Digital Gubernamental", "Sistema de capacitación online para empleados públicos"),
        ("Sistema de Gestión de Compras y Contrataciones", "Plataforma de e-procurement para el estado"),
        ("App de Denuncias y Reclamos Ciudadanos", "Sistema de gestión de quejas y sugerencias"),
        ("Portal de Salud Pública Digital", "Sistema de historia clínica electrónica integrada"),
    ]
    
    num_proyectos = random.randint(5, 10)
    proyectos = []
    
    temas_seleccionados = random.sample(temas_proyectos, min(num_proyectos, len(temas_proyectos)))
    
    for idx, (tema, descripcion) in enumerate(temas_seleccionados, 1):
        fecha_inicio = date(year, random.randint(1, 6), random.randint(1, 28))
        duracion_meses = random.randint(12, 36)
        fecha_fin = fecha_inicio + timedelta(days=duracion_meses * 30)
        
        # Si la fecha fin supera 2026, dejarlo como None (en curso)
        if fecha_fin > date(2026, 12, 31):
            fecha_fin = None
        
        logros = [
            f"Implementación exitosa en {random.randint(5, 30)} organismos públicos",
            f"Reducción del {random.randint(20, 60)}% en tiempos de gestión",
            f"Atención a {random.randint(5000, 50000)} ciudadanos/mes",
            f"Ahorro estimado de ${random.randint(100, 500)}M anuales",
            f"Satisfacción del usuario del {random.randint(80, 95)}%",
        ]
        
        dificultades = [
            "Integración con sistemas legacy de diferentes proveedores",
            "Resistencia al cambio en algunas áreas administrativas",
            "Necesidad de capacitación intensiva del personal",
            "Problemas de conectividad en zonas rurales",
            "Requisitos regulatorios y de seguridad estrictos",
        ]
        
        proyecto = Proyecto(
            codigo=f"GIDAG-{year}-{idx:03d}",
            nombre=f"{tema} {year}",
            descripcion=f"{descripcion}. Proyecto destinado a mejorar la eficiencia y transparencia "
                       f"en la gestión pública mediante soluciones tecnológicas innovadoras.",
            tipo=random.choice(["Desarrollo", "Investigación", "I+D+i", "Transferencia"]),
            fechaInicio=fecha_inicio,
            fechaFin=fecha_fin,
            logros=". ".join(random.sample(logros, 3)),
            dificultades=". ".join(random.sample(dificultades, 2))
        )
        proyecto.grupoId = grupo_id
        session.add(proyecto)
        proyectos.append(proyecto)
    
    session.flush()
    return proyectos

def crear_publicaciones(session, proyectos, instituciones):
    """Crea publicaciones asociadas a proyectos"""
    print("\n📄 Creando publicaciones...")
    
    total_pubs = 0
    
    # Primero crear documentaciones para las publicaciones
    documentaciones = []
    for i in range(50):  # Crear 50 documentaciones
        doc = Documentacion(
            texto=f"Documento de publicación científica #{i+1}\n"
                  f"Resumen: Investigación sobre tecnologías gubernamentales...",
            binario=None
        )
        session.add(doc)
        documentaciones.append(doc)
    session.flush()
    
    # Listas para almacenar relaciones proyecto-publicación
    relaciones_revistas = []
    relaciones_articulos = []
    relaciones_libros = []
    
    for proyecto in proyectos:
        num_publicaciones = random.randint(2, 10)
        
        for i in range(num_publicaciones):
            # Decidir tipo de publicación
            tipo_pub = random.choice(['revista', 'articulo', 'libro'])
            doc = random.choice(documentaciones)
            inst = random.choice(instituciones)
            
            if tipo_pub == 'revista':
                revista = Revista(
                    nombre=f"Revista de Tecnología Gubernamental",
                    issn=f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                    fecha=proyecto.fechaInicio + timedelta(days=random.randint(90, 365)),
                    editorial=inst.id,
                    numero=f"Vol. {random.randint(1, 20)} No. {random.randint(1, 4)}",
                    documentacion=doc.id
                )
                session.add(revista)
                relaciones_revistas.append((proyecto.id, revista))
                total_pubs += 1
                
            elif tipo_pub == 'articulo':
                articulo = Articulo(
                    nombre=f"Avances en {proyecto.nombre[:50]}",
                    issn=f"{random.randint(1000, 9999)}-{random.randint(1000, 9999)}",
                    fecha=proyecto.fechaInicio + timedelta(days=random.randint(90, 365)),
                    editorial=inst.id,
                    numero=f"Vol. {random.randint(1, 20)} No. {random.randint(1, 4)}",
                    pais="Argentina",
                    documentacion=doc.id
                )
                session.add(articulo)
                relaciones_articulos.append((proyecto.id, articulo))
                total_pubs += 1
                
            else:  # libro
                libro = Libro(
                    nombre=f"Manual de Implementación: {proyecto.nombre[:40]}",
                    isbn=f"978-{random.randint(100, 999)}-{random.randint(100, 999)}-{random.randint(1000, 9999)}-{random.randint(0, 9)}",
                    fecha=proyecto.fechaInicio + timedelta(days=random.randint(180, 500)),
                    editorial=inst.id,
                    tomo=None,
                    capitulo=None,
                    pais="Argentina",
                    documentacion=doc.id
                )
                session.add(libro)
                relaciones_libros.append((proyecto.id, libro))
                total_pubs += 1
    
    # Flush para obtener IDs de todas las publicaciones
    session.flush()
    
    # Ahora crear las relaciones proyecto-publicación
    for proyecto_id, revista in relaciones_revistas:
        proy_revista = ProyectoRevista(proyecto=proyecto_id, revista=revista.id)
        session.add(proy_revista)
    
    for proyecto_id, articulo in relaciones_articulos:
        proy_articulo = ProyectoArticulo(proyecto=proyecto_id, articulo=articulo.id)
        session.add(proy_articulo)
    
    for proyecto_id, libro in relaciones_libros:
        proy_libro = ProyectoLibro(proyecto=proyecto_id, libro=libro.id)
        session.add(proy_libro)
    
    print(f"  ✓ {total_pubs} publicaciones creadas")
    return total_pubs

def crear_participaciones(session, grupo_id, instituciones, year):
    """Crea participaciones en eventos"""
    
    num_eventos = random.randint(2, 5)
    
    for i in range(num_eventos):
        institucion = random.choice(instituciones)
        
        participacion = Participacion(
            grupo=grupo_id,
            institucion=institucion.id,
            rol=random.randint(1, 4),  # ID de rol_participacion
            personal=None
        )
        session.add(participacion)
    
    session.flush()
    return num_eventos

def generar_datos_completos():
    """Genera el set completo de datos"""
    session = SessionLocal()
    
    try:
        print("="*70)
        print("🚀 GENERANDO SET DE DATOS COMPLETO DESDE CERO")
        print("="*70)
        
        # 1. Limpiar datos existentes
        limpiar_datos(session)
        
        # 2. Crear instituciones
        instituciones = crear_instituciones(session)
        
        # 3. Crear grupo
        grupo = crear_grupo(session)
        
        # 4. Crear proyectos por año (2023-2026)
        print("\n📅 Creando proyectos...")
        todos_proyectos = []
        
        for year in range(2023, 2027):
            proyectos_year = crear_proyectos(session, grupo.id, year)
            todos_proyectos.extend(proyectos_year)
            print(f"  ✓ Año {year}: {len(proyectos_year)} proyectos creados")
        
        # 5. Crear publicaciones para todos los proyectos
        total_publicaciones = crear_publicaciones(session, todos_proyectos, instituciones)
        
        # 6. Commit final
        session.commit()
        
        # Resumen
        print("\n" + "="*70)
        print("✅ DATOS GENERADOS EXITOSAMENTE")
        print("="*70)
        print(f"📊 Resumen:")
        print(f"  • Grupo: {grupo.nombre}")
        print(f"  • Instituciones: {len(instituciones)}")
        print(f"  • Proyectos totales: {len(todos_proyectos)}")
        print(f"  • Publicaciones: {total_publicaciones}")
        print("="*70)
        print(f"\n💡 Puedes consultar los datos del grupo con ID: {grupo.id}")
        print(f"   Endpoint: GET /api/experto/grupo/{grupo.id}")
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Error durante la generación: {e}")
        import traceback
        traceback.print_exc()
    finally:
        session.close()

if __name__ == '__main__':
    generar_datos_completos()
