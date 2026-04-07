"""Test API de Inventario usando urllib (sin requests)"""
import urllib.request
import urllib.parse
import json

BASE_URL = 'http://127.0.0.1:5000/api'

def make_request(method, url, data=None):
    """Helper para hacer requests HTTP"""
    headers = {'Content-Type': 'application/json'}
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            body = response.read().decode('utf-8')
            return response.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode('utf-8')
        try:
            return e.code, json.loads(body)
        except:
            return e.code, {'error': body}

def print_result(test_name, status, data, expected=[200, 201]):
    if status in expected:
        print(f"✅ {test_name}: OK ({status})")
        return True
    else:
        print(f"[ERROR] {test_name}: FALLO ({status})")
        print(f"   Respuesta: {data}")
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
    status, data = make_request('POST', f'{BASE_URL}/organizaciones', payload_grupo)
    if not print_result("Crear Grupo", status, data):
        return
    grupo_id = data.get('id')
    print(f"   -> Grupo ID: {grupo_id}")

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
    status, data = make_request('POST', f'{BASE_URL}/inventario', payload_eq)
    if not print_result("Crear Equipamiento", status, data):
        return
    eq_id = data.get('id')
    print(f"   -> Equipamiento ID: {eq_id}")

    # 2.2 Listar (Filtrado por grupo)
    status, data = make_request('GET', f'{BASE_URL}/inventario?grupo_id={grupo_id}')
    print_result("Listar Equipamiento por Grupo", status, data)
    if isinstance(data, list) and len(data) > 0:
        print(f"   -> 🔍 {len(data)} items encontrados")
        print(f"   -> Primer item: {data[0].get('denominacion')} - ${data[0].get('monto')}")

    # 2.3 Obtener detalle
    status, data = make_request('GET', f'{BASE_URL}/inventario/{eq_id}')
    if print_result("Obtener Equipamiento", status, data):
        print(f"   -> Monto: ${data.get('monto')}")

    # 2.4 Modificar
    payload_update = {
        "monto": 6000.00,
        "descripcion": "Servidor actualizado"
    }
    status, data = make_request('PUT', f'{BASE_URL}/inventario/{eq_id}', payload_update)
    print_result("Modificar Equipamiento", status, data)

    # 2.5 Estadísticas
    status, data = make_request('GET', f'{BASE_URL}/inventario/estadisticas/grupo/{grupo_id}')
    if print_result("Obtener Estadísticas", status, data):
        print(f"   -> 📊 Total Items: {data['total_items']}, Valor Total: ${data['total_value']:.2f}")

    # --- 3. BIBLIOGRAFÍA ---
    print("\n--- 3. BIBLIOGRAFÍA ---")
    
    # 3.1 Crear Bibliografía
    payload_bib = {
        "titulo": "Inteligencia Artificial en Aplicaciones Gubernamentales",
        "autores": "García, J., Martínez, A.",
        "editorial": "Editorial Tecnológica",
        "fecha": "2023-06-15",
        "grupo": grupo_id
    }
    
    status, data = make_request('POST', f'{BASE_URL}/inventario/bibliografia', payload_bib)
    
    if not print_result("Crear Bibliografía", status, data):
        print("   -> ⚠️ Error al crear bibliografía")
        bib_id = None
    else:
        bib_id = data.get('id')
        print(f"   -> Bibliografía ID: {bib_id}")

        # 3.2 Listar
        status, data = make_request('GET', f'{BASE_URL}/inventario/bibliografia?grupo_id={grupo_id}')
        if print_result("Listar Bibliografía", status, data):
            if isinstance(data, list) and len(data) > 0:
                print(f"   -> 📚 {len(data)} items encontrados")
                print(f"   -> Primer item: {data[0].get('titulo')}")

        # 3.3 Obtener detalle
        if bib_id:
            status, data = make_request('GET', f'{BASE_URL}/inventario/bibliografia/{bib_id}')
            print_result("Obtener Bibliografía", status, data)

    # --- 4. LIMPIEZA ---
    print("\n--- 4. LIMPIEZA ---")
    
    # Borrar Bibliografía
    if bib_id:
        status, data = make_request('DELETE', f'{BASE_URL}/inventario/bibliografia/{bib_id}')
        print_result(f"Borrar Bibliografía ID={bib_id}", status, data)

    # Borrar Equipamiento
    status, data = make_request('DELETE', f'{BASE_URL}/inventario/{eq_id}')
    print_result(f"Borrar Equipamiento ID={eq_id}", status, data)

    # Borrar Grupo
    status, data = make_request('DELETE', f'{BASE_URL}/organizaciones/{grupo_id}')
    print_result(f"Borrar Grupo ID={grupo_id}", status, data)

    print("\n" + "="*70)
    print("✅ TEST DE INVENTARIO FINALIZADO")
    print("="*70)

if __name__ == '__main__':
    try:
        run_tests()
    except Exception as e:
        print(f"[ERROR] Error de conexion: {e}")
        print("   Asegurate de que 'app.py' este corriendo en http://127.0.0.1:5000")
