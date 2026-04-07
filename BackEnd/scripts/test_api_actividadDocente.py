import requests
import json

# Configuración
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

def verify_change(entity, field, expected_value, response_json):
    # Obtenemos el valor real. Si es un diccionario anidado, lo maneja el caller,
    # pero aquí asumimos que recibimos el objeto 'actividad' directo o dentro de un wrapper.
    if 'actividad' in response_json:
        actual_value = response_json['actividad'].get(field)
    else:
        actual_value = response_json.get(field)
        
    # Comparación robusta (todo a string)
    if str(actual_value) == str(expected_value):
        print(f"   -> 🔍 Campo '{field}': Actualizado correctamente a '{actual_value}'")
    else:
        print(f"   -> ⚠️ Campo '{field}': ERROR. Esperaba '{expected_value}', recibió '{actual_value}'")

def run_tests():
    print("="*70)
    print("🚀 TEST DE ACTIVIDAD DOCENTE (FECHAS Y RELACIONES)")
    print("="*70)

    # --- 1. PREPARACIÓN (NECESITAMOS UNA PERSONA) ---
    print("\n--- 1. SETUP (Crear Persona Dummy) ---")
    
    # 1.1 Crear Grado
    res = requests.post(f'{BASE_URL}/grados-academicos/', json={"nombre": "Grado Test Actividad"}, headers=HEADERS)
    if not print_result("Crear Grado Auxiliar", res): return
    grado_id = res.json().get('id')

    # 1.2 Crear Investigador (Necesitamos un ID de persona válido)
    payload_inv = {
        "nombre": "Profe", "apellido": "Test", "horas": 10, 
        "gradoAcademicoId": grado_id, "institucionId": INSTITUCION_ID, 
        "categoria": "C", "incentivo": "No", "dedicacion": "Simple"
    }
    res = requests.post(f'{BASE_URL}/investigadores/', json=payload_inv, headers=HEADERS)
    if not print_result("Crear Investigador Auxiliar", res): return
    inv_id = res.json()['investigador']['id']


    # --- 2. CREAR ACTIVIDAD DOCENTE ---
    print("\n--- 2. CREAR ACTIVIDAD (POST) ---")
    payload_act = {
        "fechaInicio": "2023-03-01",  # Formato YYYY-MM-DD
        "fechaFin": "2023-07-31",
        "rol": "Jefe de Trabajos Prácticos",
        "personalId": inv_id,
        "institucionId": INSTITUCION_ID
    }
    res = requests.post(f'{BASE_URL}/actividades-docente/', json=payload_act, headers=HEADERS)
    if not print_result("Crear Actividad Docente", res): return
    
    act_id = res.json()['actividad']['id']
    # Verificamos que las fechas volvieron bien
    verify_change('actividad', 'fechaInicio', '2023-03-01', res.json())


    # --- 3. MODIFICAR ACTIVIDAD DOCENTE ---
    print("\n--- 3. MODIFICAR ACTIVIDAD (PUT) ---")
    # Cambiamos Rol y extendemos la fecha de fin
    payload_update = {
        "rol": "Profesor Adjunto",
        "fechaFin": "2023-12-31"
    }
    res = requests.put(f'{BASE_URL}/actividades-docente/{act_id}', json=payload_update, headers=HEADERS)
    print_result("Modificar Actividad", res)
    
    # Verificamos los cambios
    verify_change('actividad', 'rol', 'Profesor Adjunto', res.json())
    verify_change('actividad', 'fechaFin', '2023-12-31', res.json())


    # --- 4. OBTENER LISTADO (GET ALL) ---
    print("\n--- 4. LISTAR TODAS (GET) ---")
    res = requests.get(f'{BASE_URL}/actividades-docente/')
    print_result("Obtener lista", res)
    
    # Verificar que nuestra actividad está en la lista
    actividades = res.json()
    encontrada = any(a['id'] == act_id for a in actividades)
    if encontrada:
        print(f"   -> 🔍 Actividad ID={act_id} encontrada en la lista global.")
    else:
        print(f"   -> ⚠️ ERROR: La actividad ID={act_id} no aparece en el listado.")


    # --- 5. LIMPIEZA ---
    print("\n--- 5. LIMPIEZA ---")
    
    # Borrar Actividad
    res = requests.delete(f'{BASE_URL}/actividades-docente/{act_id}')
    print_result(f"Borrar Actividad ID={act_id}", res)

    # Borrar Investigador
    res = requests.delete(f'{BASE_URL}/investigadores/{inv_id}')
    print_result(f"Borrar Investigador Auxiliar ID={inv_id}", res)

    # Borrar Grado
    requests.delete(f'{BASE_URL}/grados-academicos/{grado_id}')
    print(f"🗑️  Borrado Grado ID={grado_id}")

    print("\n✅ TEST DE ACTIVIDAD DOCENTE FINALIZADO")

if __name__ == '__main__':
    try:
        requests.get(f'{BASE_URL}/hello')
        run_tests()
    except:
        print("❌ Error de conexión. Asegúrate de que 'app.py' esté corriendo.")