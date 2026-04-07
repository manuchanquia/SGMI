import requests
import json

# Configuración
BASE_URL = 'http://127.0.0.1:5000/api'
HEADERS = {'Content-Type': 'application/json'}

def print_result(test_name, response, expected_status=[200, 201]):
    if response.status_code in expected_status:
        print(f"✅ {test_name}: OK ({response.status_code})")
        return True
    else:
        print(f"❌ {test_name}: FALLÓ ({response.status_code})")
        try:
            print(f"   Respuesta: {response.json()}")
        except:
            print(f"   Respuesta: {response.text}")
        return False

def run_tests():
    print("="*70)
    print("🚀 TEST DE INVENTARIO (EQUIPAMIENTO Y BIBLIOGRAFÍA)")
    print("="*70)

    # --- 1. SETUP: CREAR GRUPO ---
    print("\n--- 1. SETUP (Grupo Auxiliar) ---")
    payload_grupo = {
        "sigla": "INV-TEST",
        "nombre": "Grupo Test Inventario",
        "objetivos": "Probar items"
    }
    # Asumimos que el endpoint de organizaciones funciona (ya lo probamos)
    res = requests.post(f'{BASE_URL}/organizaciones', json=payload_grupo, headers=HEADERS)
    if not print_result("Crear Grupo", res): return
    grupo_id = res.json().get('id')


    # --- 2. EQUIPAMIENTO ---
    print("\n--- 2. EQUIPAMIENTO ---")
    
    # 2.1 Crear Equipamiento
    payload_eq = {
        "denominacion": "Servidor Dell PowerEdge",
        "fecha_ingreso": "2023-05-15",
        "monto": 5000.50,
        "grupo": grupo_id,
        "descripcion": "Servidor para base de datos"
    }
    # Nota: El endpoint es /api/inventario (sin nada más para equipamiento, según el código)
    res = requests.post(f'{BASE_URL}/inventario', json=payload_eq, headers=HEADERS)
    if not print_result("Crear Equipamiento", res): return
    eq_id = res.json().get('id')

    # 2.2 Listar (Filtrado por grupo)
    res = requests.get(f'{BASE_URL}/inventario?grupo_id={grupo_id}')
    print_result("Listar Equipamiento por Grupo", res)
    items = res.json()
    if len(items) > 0 and items[0]['id'] == eq_id:
        print(f"   -> 🔍 Verificación: Item encontrado en la lista.")
    else:
        print(f"   -> ⚠️ ERROR: El item no aparece en la lista.")

    # 2.3 Modificar
    payload_update = {
        "monto": 6000.00,
        "descripcion": "Servidor actualizado"
    }
    res = requests.put(f'{BASE_URL}/inventario/{eq_id}', json=payload_update, headers=HEADERS)
    print_result("Modificar Equipamiento", res)

    # 2.4 Estadísticas
    res = requests.get(f'{BASE_URL}/inventario/estadisticas/grupo/{grupo_id}')
    if print_result("Obtener Estadísticas", res):
        stats = res.json()
        print(f"   -> 📊 Total Items: {stats['total_items']}, Valor Total: {stats['total_value']}")


    # --- 3. BIBLIOGRAFÍA ---
    print("\n--- 3. BIBLIOGRAFÍA ---")
    
    # 3.1 Crear Bibliografía
    # Campos correctos según el modelo: titulo, autores, editorial, fecha, grupo
    
    payload_bib = {
        "titulo": "Inteligencia Artificial en Aplicaciones Gubernamentales",
        "autores": "García, J., Martínez, A.",
        "editorial": "Editorial Tecnológica",
        "fecha": "2023-06-15",
        "grupo": grupo_id
    }
    
    res = requests.post(f'{BASE_URL}/inventario/bibliografia', json=payload_bib, headers=HEADERS)
    
    if not print_result("Crear Bibliografía", res):
        print("   -> ⚠️ Error al crear bibliografía")
        bib_id = None
    else:
        bib_id = res.json().get('id')

        # 3.2 Listar
        res = requests.get(f'{BASE_URL}/inventario/bibliografia?grupo_id={grupo_id}')
        print_result("Listar Bibliografía", res)

        if bib_id:
            # 3.3 Borrar
            res = requests.delete(f'{BASE_URL}/inventario/bibliografia/{bib_id}')
            print_result("Borrar Bibliografía", res)


    # --- 4. LIMPIEZA ---
    print("\n--- 4. LIMPIEZA ---")
    
    # Borrar Equipamiento
    res = requests.delete(f'{BASE_URL}/inventario/{eq_id}')
    print_result(f"Borrar Equipamiento ID={eq_id}", res)

    # Borrar Grupo
    res = requests.delete(f'{BASE_URL}/organizaciones/{grupo_id}')
    print_result(f"Borrar Grupo ID={grupo_id}", res)

    print("\n✅ TEST DE INVENTARIO FINALIZADO")

if __name__ == '__main__':
    try:
        requests.get(f'{BASE_URL}/hello')
        run_tests()
    except:
        print("❌ Error de conexión. Asegúrate de que 'app.py' esté corriendo.")