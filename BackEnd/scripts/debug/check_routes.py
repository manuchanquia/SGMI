import sys
import os

# Agregamos el path para poder importar app
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../')))

from app import app

print("="*60)
print("🔍 LISTADO DE RUTAS REGISTRADAS EN FLASK")
print("="*60)

found = False
# Recorremos todas las reglas de URL que Flask conoce
for rule in app.url_map.iter_rules():
    # Filtramos para ver solo las de organizaciones
    if "organizaciones" in str(rule):
        print(f"✅ {rule.endpoint}: {rule}")
        if "detalle" in str(rule):
            found = True

print("-" * 60)
if found:
    print("🎉 LA RUTA '/detalle' ESTÁ REGISTRADA CORRECTAMENTE.")
else:
    print("⚠️  LA RUTA '/detalle' NO APARECE. FLASK NO LA ESTÁ LEYENDO.")
    print("   -> Revisa que el código esté guardado en 'ControladorOrganizaciones.py'.")
    print("   -> Revisa la indentación del decorador @org_bp.route.")