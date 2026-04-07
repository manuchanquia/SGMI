"""
Test script for ControladorPersonal API endpoints
"""
import urllib.request
import urllib.error
import json

BASE_URL = 'http://127.0.0.1:5000/api/personal'

def make_request(url, method='GET', data=None):
    """Helper function to make HTTP requests using urllib."""
    headers = {'Content-Type': 'application/json'}
    
    if data:
        data = json.dumps(data).encode('utf-8')
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as response:
            response_data = response.read().decode('utf-8')
            return json.loads(response_data) if response_data else {}, response.status
    except urllib.error.HTTPError as e:
        error_data = e.read().decode('utf-8')
        return json.loads(error_data) if error_data else {}, e.code

def print_result(test_name, status, expected=None):
    """Print test result."""
    if expected is None or status == expected:
        print(f"[OK] {test_name}: {status}")
    else:
        print(f"[ERROR] {test_name}: FALLO ({status}, esperado {expected})")

def run_tests():
    """Run all Personal API tests."""
    print("="*70)
    print("[TEST] CONTROLADOR PERSONAL")
    print("="*70)
    
    # Variables to store created IDs
    grupo_id = None
    investigador_id = None
    profesional_id = None
    actividad_id = None
    
    try:
        # 1. Create test grupo (needed for foreign key)
        print("\n--- 1. SETUP (Grupo y Grado Academico) ---")
        grupo_data = {
            'sigla': 'TEST-PERS',
            'nombre': 'Grupo Test Personal',
            'objetivos': 'Testing personal endpoints'
        }
        grupo_response, status = make_request('http://127.0.0.1:5000/api/organizaciones', 'POST', grupo_data)
        print_result('Crear Grupo', status, 201)
        if status == 201 and 'grupo' in grupo_response:
            grupo_id = grupo_response['grupo']['id']
            print(f"   -> Grupo ID: {grupo_id}")
        
        # 2. Create Investigador
        print("\n--- 2. CREAR INVESTIGADOR ---")
        investigador_data = {
            'nombre': 'Carlos',
            'apellido': 'Rodriguez',
            'horas': 40,
            'objectType': 'investigador',
            'gradoAcademicoId': 1,  # Assuming grado exists
            'institucionId': 1,  # Assuming institucion exists
            'categoria': 'Senior',
            'incentivo': 'Categoria I',
            'dedicacion': 'Exclusiva',
            'email': 'carlos.rodriguez@test.com',
            'clave': 'test123'
        }
        response, status = make_request(BASE_URL, 'POST', investigador_data)
        print_result('Crear Investigador', status, 201)
        if status == 201 and 'personal' in response:
            investigador_id = response['personal']['id']
            print(f"   -> Investigador ID: {investigador_id}")
        
        # 3. List all Personal
        print("\n--- 3. LISTAR PERSONAL ---")
        response, status = make_request(BASE_URL, 'GET')
        print_result('Listar Personal', status, 200)
        if status == 200:
            print(f"   -> Total: {len(response)} personas")
        
        # 4. Get specific Investigador
        if investigador_id:
            print("\n--- 4. OBTENER INVESTIGADOR ---")
            response, status = make_request(f"{BASE_URL}/{investigador_id}", 'GET')
            print_result('Obtener Investigador', status, 200)
            if status == 200:
                print(f"   -> Nombre: {response.get('nombre')} {response.get('apellido')}")
                print(f"   -> Categoria: {response.get('categoria')}")
        
        # 5. Update Investigador
        if investigador_id:
            print("\n--- 5. MODIFICAR INVESTIGADOR ---")
            update_data = {
                'categoria': 'Principal',
                'horas': 45
            }
            response, status = make_request(f"{BASE_URL}/{investigador_id}", 'PUT', update_data)
            print_result('Modificar Investigador', status, 200)
        
        # 6. Create Profesional
        print("\n--- 6. CREAR PROFESIONAL ---")
        profesional_data = {
            'nombre': 'Ana',
            'apellido': 'Martinez',
            'horas': 30,
            'objectType': 'profesional',
            'gradoAcademicoId': 1,
            'institucionId': 1,
            'especialidad': 'Desarrollo de Software',
            'descripcion': 'Especialista en backend',
            'email': 'ana.martinez@test.com'
        }
        response, status = make_request(BASE_URL, 'POST', profesional_data)
        print_result('Crear Profesional', status, 201)
        if status == 201 and 'personal' in response:
            profesional_id = response['personal']['id']
            print(f"   -> Profesional ID: {profesional_id}")
        
        # 7. Create Actividad Docente for Investigador
        if investigador_id:
            print("\n--- 7. CREAR ACTIVIDAD DOCENTE ---")
            actividad_data = {
                'rol': 'Profesor Titular',
                'institucionId': 1,
                'fechaInicio': '2024-01-01',
                'fechaFin': '2024-12-31'
            }
            response, status = make_request(
                f"{BASE_URL}/{investigador_id}/actividades-docente", 
                'POST', 
                actividad_data
            )
            print_result('Crear Actividad Docente', status, 201)
            if status == 201 and 'actividad' in response:
                actividad_id = response['actividad']['id']
                print(f"   -> Actividad ID: {actividad_id}")
        
        # 8. List Actividades Docentes
        if investigador_id:
            print("\n--- 8. LISTAR ACTIVIDADES DOCENTES ---")
            response, status = make_request(
                f"{BASE_URL}/{investigador_id}/actividades-docente", 
                'GET'
            )
            print_result('Listar Actividades Docentes', status, 200)
            if status == 200:
                print(f"   -> Total: {len(response)} actividades")
        
        # 9. Filter by object_type
        print("\n--- 9. FILTRAR POR TIPO ---")
        response, status = make_request(f"{BASE_URL}?objectType=investigador", 'GET')
        print_result('Filtrar Investigadores', status, 200)
        if status == 200:
            print(f"   -> Investigadores: {len(response)}")
        
        print("\n--- 10. LIMPIEZA ---")
        
        # Delete Actividad Docente
        if investigador_id and actividad_id:
            response, status = make_request(
                f"{BASE_URL}/{investigador_id}/actividades-docente/{actividad_id}", 
                'DELETE'
            )
            print_result(f'Borrar Actividad Docente ID={actividad_id}', status, 200)
        
        # Delete Profesional
        if profesional_id:
            response, status = make_request(f"{BASE_URL}/{profesional_id}", 'DELETE')
            print_result(f'Borrar Profesional ID={profesional_id}', status, 200)
        
        # Delete Investigador
        if investigador_id:
            response, status = make_request(f"{BASE_URL}/{investigador_id}", 'DELETE')
            print_result(f'Borrar Investigador ID={investigador_id}', status, 200)
        
        # Delete Grupo
        if grupo_id:
            response, status = make_request(
                f'http://127.0.0.1:5000/api/organizaciones/{grupo_id}', 
                'DELETE'
            )
            print_result(f'Borrar Grupo ID={grupo_id}', status)
            if status != 200:
                print(f"   Respuesta: {response}")
        
    except Exception as e:
        print(f"\n[ERROR] Exception: {e}")
        import traceback
        traceback.print_exc()
    
    print("\n" + "="*70)
    print("[TEST] CONTROLADOR PERSONAL FINALIZADO")
    print("="*70)

if __name__ == '__main__':
    try:
        run_tests()
    except Exception as e:
        print(f"[ERROR] Error de conexion: {e}")
        print("   Asegurate de que 'app.py' este corriendo en http://127.0.0.1:5000")
