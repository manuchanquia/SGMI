import requests
import json

BASE_URL = 'http://127.0.0.1:5000/api'
HEADERS = {'Content-Type': 'application/json'}

def print_result(test_name, response, expected_status=[200, 201]):
    if response.status_code in expected_status:
        print(f"✅ {test_name}: OK ({response.status_code})")
        return True
    else:
        print(f"❌ {test_name}: FALLÓ ({response.status_code})")
        print(f"   Respuesta: {response.text}")
        return False

def run_tests():
    print("="*70)
    print("🚀 TEST DE PROYECTOS")
    print("="*70)

    # 1. SETUP: Crear un Grupo (Necesario para el proyecto)
    print("\n--- 1. SETUP ---")
    payload_grupo = {"sigla": "G-PROY", "nombre": "Grupo Proyectos", "objetivos": "Test"}
    res = requests.post(f'{BASE_URL}/organizaciones', json=payload_grupo, headers=HEADERS)
    if not print_result("Crear Grupo Auxiliar", res): return
    grupo_id = res.json().get('id')

    # 2. CREAR PROYECTO
    print("\n--- 2. CREAR PROYECTO ---")
    payload_proy = {
        "codigo": "P-2024-001",
        "nombre": "Sistema de Gestión Inteligente",
        "descripcion": "Desarrollo de IA",
        "tipo": "I+D",
        "logros": "Prototipo funcional",
        "dificultades": "Falta de GPU",
        "fechaInicio": "2024-01-01",
        "fechaFin": "2024-12-31",
        "grupoId": grupo_id
    }
    res = requests.post(f'{BASE_URL}/proyectos/', json=payload_proy, headers=HEADERS)
    if not print_result("Crear Proyecto", res): return
    proy_id = res.json()['proyecto']['id']

    # 3. MODIFICAR PROYECTO
    print("\n--- 3. MODIFICAR PROYECTO ---")
    payload_update = {
        "nombre": "Sistema de Gestión v2.0",
        "fechaFin": "2025-06-30"
    }
    res = requests.put(f'{BASE_URL}/proyectos/{proy_id}', json=payload_update, headers=HEADERS)
    print_result("Modificar Proyecto", res)
    
    # 4. LISTAR
    print("\n--- 4. LISTAR ---")
    res = requests.get(f'{BASE_URL}/proyectos/')
    print_result("Listar Proyectos", res)

    # 5. LIMPIEZA
    print("\n--- 5. LIMPIEZA ---")
    res = requests.delete(f'{BASE_URL}/proyectos/{proy_id}')
    print_result("Borrar Proyecto", res)
    
    res = requests.delete(f'{BASE_URL}/organizaciones/{grupo_id}')
    print_result("Borrar Grupo", res)

    print("\n✅ TEST DE PROYECTOS FINALIZADO")

if __name__ == '__main__':
    try:
        requests.get(f'{BASE_URL}/hello')
        run_tests()
    except:
        print("❌ Error de conexión.")