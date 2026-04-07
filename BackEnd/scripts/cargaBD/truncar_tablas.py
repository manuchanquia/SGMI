"""Script para limpiar TODAS las tablas truncándolas en orden"""

import psycopg2

# Configuración
DATABASE_URI = 'postgresql://postgres.hxrdfvfeiddvydvilrsa:Segundo_Francia_2025@aws-1-us-east-2.pooler.supabase.com:6543/postgres'

def truncar_tablas():
    """Trunca todas las tablas relevantes en orden"""
    conn = psycopg2.connect(DATABASE_URI)
    cur = conn.cursor()
    
    try:
        print("=" * 70)
        print("🗑️  TRUNCANDO TODAS LAS TABLAS")
        print("=" * 70)
        
        # Desactivar temporalmente los checks de FK
        cur.execute("SET session_replication_role = 'replica';")
        
        tablas = [
            'proyecto_libro',
            'proyecto_revista',
            'proyecto_articulo',
            'participacion_persona',
            'participacion',
            'distincion',
            'erogacion',
            'bibliografia',
            'equipamiento',
            'actividad_docente',
            'persona_grupo',
            'proyecto',
            'grupo',
            'libro',
            'revista',
            'articulo',
            'documentacion',
        ]
        
        for tabla in tablas:
            try:
                cur.execute(f"TRUNCATE TABLE {tabla} RESTART IDENTITY CASCADE;")
                print(f"  ✓ {tabla} truncada")
            except Exception as e:
                print(f"  ⚠️  Error en {tabla}: {e}")
        
        # Reactivar checks de FK
        cur.execute("SET session_replication_role = 'origin';")
        
        conn.commit()
        print("\n✅ Tablas truncadas exitosamente")
        
    except Exception as e:
        conn.rollback()
        print(f"\n❌ Error: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    truncar_tablas()
