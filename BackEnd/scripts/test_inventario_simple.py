"""Test simple de API de Inventario usando urllib"""
import urllib.request
import urllib.parse
import json

BASE_URL = 'http://127.0.0.1:5000/api'

def make_request(method, url, data=None):
    """Hacer petición HTTP"""
    headers = {'Content-Type': 'application/json'}
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            body = json.loads(response.read().decode())
            return response.status, body
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read().decode())
        except:
            body = {'error': str(e)}
        return e.code, body
    except Exception as e:
        return 0, {'error': str(e)}

print("="*70)
print("🚀 TEST DE INVENTARIO")
print("="*70)

# 1. Crear Grupo
print("\n--- 1. Crear Grupo ---")
status, resp = make_request('POST', f'{BASE_URL}/organizaciones', {
    "sigla": "INV-TEST",
    "nombre": "Grupo Test Inventario",
    "objetivos": "Probar items"
})
print(f"Status: {status}")
if status == 201:
    grupo_id = resp.get('id')
    print(f"✅ Grupo creado: ID={grupo_id}")
else:
    print(f"❌ Error: {resp}")
    exit(1)

# 2. Crear Equipamiento
print("\n--- 2. Crear Equipamiento ---")
status, resp = make_request('POST', f'{BASE_URL}/inventario', {
    "denominacion": "Servidor Dell",
    "fecha_ingreso": "2023-05-15",
    "monto": 5000.50,
    "grupo": grupo_id,
    "descripcion": "Servidor de prueba"
})
print(f"Status: {status}")
if status == 201:
    eq_id = resp.get('id')
    print(f"✅ Equipamiento creado: ID={eq_id}")
else:
    print(f"❌ Error: {resp}")

# 3. Listar Equipamiento
print("\n--- 3. Listar Equipamiento ---")
status, resp = make_request('GET', f'{BASE_URL}/inventario?grupo_id={grupo_id}')
print(f"Status: {status}, Items: {len(resp) if isinstance(resp, list) else 0}")
if status == 200:
    print(f"✅ Listado exitoso: {len(resp)} items")
else:
    print(f"❌ Error: {resp}")

# 4. Crear Bibliografía (con campos corregidos)
print("\n--- 4. Crear Bibliografía ---")
status, resp = make_request('POST', f'{BASE_URL}/inventario/bibliografia', {
    "titulo": "Inteligencia Artificial Aplicada",
    "autores": "García, J. et al.",
    "editorial": "Editorial Técnica",
    "fecha": "2023-06-15",
    "grupo": grupo_id
})
print(f"Status: {status}")
if status == 201:
    bib_id = resp.get('id')
    print(f"✅ Bibliografía creada: ID={bib_id}")
    
    # 5. Listar Bibliografía
    print("\n--- 5. Listar Bibliografía ---")
    status, resp = make_request('GET', f'{BASE_URL}/inventario/bibliografia?grupo_id={grupo_id}')
    print(f"Status: {status}, Items: {len(resp) if isinstance(resp, list) else 0}")
    if status == 200:
        print(f"✅ Listado exitoso: {len(resp)} items")
    
    # Cleanup bibliografía
    status, resp = make_request('DELETE', f'{BASE_URL}/inventario/bibliografia/{bib_id}')
    print(f"Bibliografía eliminada: {status}")
else:
    print(f"❌ Error: {resp}")

# Cleanup
print("\n--- 6. Limpieza ---")
if 'eq_id' in locals():
    status, resp = make_request('DELETE', f'{BASE_URL}/inventario/{eq_id}')
    print(f"Equipamiento eliminado: {status}")

status, resp = make_request('DELETE', f'{BASE_URL}/organizaciones/{grupo_id}')
print(f"Grupo eliminado: {status}")

print("\n✅ TEST COMPLETADO")
