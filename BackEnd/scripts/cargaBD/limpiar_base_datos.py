"""Script para limpiar completamente la base de datos"""

import os
import sys
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.models_db import (
    ProyectoLibro, ProyectoRevista, ProyectoArticulo,
    Libro, Revista, Articulo, Documentacion,
    Participacion, ParticipacionPersona, Institucion
)
from models.proyecto import Proyecto
from models.grupo import Grupo
from models.personaGrupo import PersonaGrupo

# Configuración base de datos
DATABASE_URI = 'postgresql://postgres.hxrdfvfeiddvydvilrsa:Segundo_Francia_2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres'

# Create engine and session
engine = create_engine(DATABASE_URI)
SessionLocal = sessionmaker(bind=engine)

def limpiar_todo():
    """Elimina TODOS los datos en el orden correcto"""
    session = SessionLocal()
    
    try:
        print("=" * 70)
        print("🧹 LIMPIANDO TODA LA BASE DE DATOS")
        print("=" * 70)
        
        # Orden de eliminación respetando foreign keys
        tablas = [
            ("ProyectoLibro", ProyectoLibro),
            ("ProyectoRevista", ProyectoRevista),
            ("ProyectoArticulo", ProyectoArticulo),
            ("Libro", Libro),
            ("Revista", Revista),
            ("Articulo", Articulo),
            ("ParticipacionPersona", ParticipacionPersona),
            ("Participacion", Participacion),
            ("PersonaGrupo", PersonaGrupo),
            ("Proyecto", Proyecto),
            ("Grupo", Grupo),
            ("Documentacion", Documentacion),
            ("Institucion", Institucion),
        ]
        
        for nombre, modelo in tablas:
            try:
                count = session.query(modelo).delete()
                session.flush()
                print(f"  ✓ {nombre}: {count} registros eliminados")
            except Exception as e:
                print(f"  ⚠️  Error en {nombre}: {e}")
        
        session.commit()
        print("\n✅ Base de datos limpiada exitosamente")
        
    except Exception as e:
        session.rollback()
        print(f"\n❌ Error al limpiar: {e}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    limpiar_todo()
