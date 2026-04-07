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
        print(f"   Respuesta: {response.text}")
        return False

def run_tests():
    print("="*70)
    print("🚀 TEST DE ORGANIZACIONES (SOLO GRUPOS Y MIEMBROS)")
    print("="*70)

    # 1. SETUP (Solo Persona y Grado)
    print("\n--- 1. SETUP ---")
    res = requests.post(f'{BASE_URL}/grados-academicos/', json={"nombre": "Grado Org"}, headers=HEADERS)
    if not print_result("Crear Grado", res): return
    grado_id = res.json().get('grado', {}).get('id') or res.json().get('id')

    payload_inv = {"nombre": "Juan", "apellido": "Org", "horas": 10, "gradoAcademicoId": grado_id, "institucionId": INSTITUCION_ID, "categoria": "C", "incentivo": "No", "dedicacion": "Simple"}
    res = requests.post(f'{BASE_URL}/investigadores/', json=payload_inv, headers=HEADERS)
    if not print_result("Crear Persona", res): return
    
    data_inv = res.json()
    persona_id = data_inv.get('investigador', {}).get('id') or data_inv.get('id')

    # 2. GRUPO
    print("\n--- 2. GRUPO ---")
    payload_grupo = {"sigla": "G-CLEAN", "nombre": "Grupo Limpio", "objetivos": "Testing"}
    res = requests.post(f'{BASE_URL}/organizaciones', json=payload_grupo, headers=HEADERS)
    if not print_result("Crear Grupo", res): return
    grupo_id = res.json().get('id')

    res = requests.get(f'{BASE_URL}/organizaciones/{grupo_id}')
    print_result("Obtener Grupo", res)

    # 3. MIEMBROS (Solo Persona y Fechas)
    print("\n--- 3. MIEMBROS ---")
    payload_miembro = {
        "persona": persona_id,
        "fecha_inicio": "2024-01-01"
    }
    res = requests.post(f'{BASE_URL}/organizaciones/{grupo_id}/miembros', json=payload_miembro, headers=HEADERS)
    if not print_result("Agregar Miembro", res): return
    pg_id = res.json().get('id')

    # 4. DETALLE (Solo debe traer miembros)
    res = requests.get(f'{BASE_URL}/organizaciones/{grupo_id}/detalle')
    if print_result("Obtener Detalle", res):
        miembros = res.json().get('miembros', [])
        if any(m['persona']['id'] == persona_id for m in miembros):
            print("   -> 🔍 Miembro encontrado en el detalle.")
        else:
            print("   -> ⚠️ ERROR: Miembro no encontrado.")

    # 5. LIMPIEZA
    print("\n--- 5. LIMPIEZA ---")
    requests.delete(f'{BASE_URL}/organizaciones/{grupo_id}')
    requests.delete(f'{BASE_URL}/investigadores/{persona_id}')
    requests.delete(f'{BASE_URL}/grados-academicos/{grado_id}')
    print("✅ TEST FINALIZADO")

if __name__ == '__main__':
    try:
        requests.get(f'{BASE_URL}/hello')
        run_tests()
    except:
        print("❌ Error de conexión.")