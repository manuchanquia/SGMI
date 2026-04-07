import requests
import json

BASE_URL = 'http://127.0.0.1:5000/api'
HEADERS = {'Content-Type': 'application/json'}
INSTITUCION_ID = 1 

def print_result(test_name, response, expected_status=[200, 201]):
    if response.status_code in expected_status:
        print(f"✅ {test_name}: OK ({response.status_code})")
        return True
    else:
        print(f"❌ {test_name}: FALLÓ ({response.status_code})")
        try: print(f"   Respuesta: {response.json()}")
        except: print(f"   Respuesta: {response.text}")
        return False

def run_tests():
    print("="*70)
    print("🚀 TEST DE PARTICIPACIONES (SIN FECHAS)")
    print("="*70)

    # 1. SETUP
    print("\n--- 1. SETUP ---")
    res = requests.post(f'{BASE_URL}/organizaciones', json={"sigla": "PART-FIX", "nombre": "Grupo P", "objetivos": "T"}, headers=HEADERS)
    if not print_result("Crear Grupo", res): return
    grupo_id = res.json().get('id')

    res = requests.post(f'{BASE_URL}/participacion/roles', json={"nombre": "Expositor"}, headers=HEADERS)
    if not print_result("Crear Rol", res): return
    rol_id = res.json().get('id')

    # Crear Persona
    res = requests.post(f'{BASE_URL}/grados-academicos/', json={"nombre": "Grado P"}, headers=HEADERS)
    grado_id = res.json().get('grado', {}).get('id') or res.json().get('id')
    payload_inv = {"nombre": "Juan", "apellido": "P", "horas": 10, "gradoAcademicoId": grado_id, "institucionId": INSTITUCION_ID, "categoria": "C", "incentivo": "No", "dedicacion": "Simple"}
    res = requests.post(f'{BASE_URL}/investigadores/', json=payload_inv, headers=HEADERS)
    print_result("Crear Persona", res)
    data_inv = res.json()
    persona_id = data_inv.get('investigador', {}).get('id') or data_inv.get('id')

    # 2. PARTICIPACIÓN
    print("\n--- 2. PARTICIPACIÓN (CRUD) ---")
    
    # Crear (Sin fechas, con persona obligatoria)
    payload_part = {
        "grupo": grupo_id,
        "institucion": INSTITUCION_ID,
        "rol": rol_id,
        "persona": persona_id
    }
    res = requests.post(f'{BASE_URL}/participacion', json=payload_part, headers=HEADERS)
    if not print_result("Crear Participación", res): return
    part_id = res.json().get('id')
    res = requests.post(f'{BASE_URL}/investigadores/', json={
        "nombre": "Participante", "apellido": "Reemplazo", "horas": 5, 
        "gradoAcademicoId": grado_id, "institucionId": INSTITUCION_ID, 
        "categoria": "C", "incentivo": "No", "dedicacion": "Simple"
    }, headers=HEADERS)
    persona_id_2 = res.json().get('investigador', {}).get('id')

    res = requests.put(f'{BASE_URL}/participacion/{part_id}', json={"persona": persona_id_2}, headers=HEADERS)
    print_result("Cambiar Persona en Participación", res)
    

    # Listar
    res = requests.get(f'{BASE_URL}/participacion?grupo_id={grupo_id}')
    print_result("Listar", res)

    # 3. LIMPIEZA
    print("\n--- 3. LIMPIEZA ---")
    requests.delete(f'{BASE_URL}/participacion/{part_id}')
    print("✅ Borrar Participación")
    requests.delete(f'{BASE_URL}/organizaciones/{grupo_id}')
    requests.delete(f'{BASE_URL}/investigadores/{persona_id}')
    requests.delete(f'{BASE_URL}/grados-academicos/{grado_id}')
    requests.delete(f'{BASE_URL}/investigadores/{persona_id_2}')

    print("\n✅ TEST FINALIZADO")

if __name__ == '__main__':
    try:
        requests.get(f'{BASE_URL}/hello')
        run_tests()
    except:
        print("❌ Error de conexión.")