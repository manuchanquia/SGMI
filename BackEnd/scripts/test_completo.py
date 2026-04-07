import requests

# === CONFIGURACIÓN ===
BASE_URL = 'http://localhost:5000/api'

# Credenciales (Deben existir en tu BD)
USER_ADMIN = {'email': 'admin@test.com', 'clave': '123456'} 
USER_VIEWER = {'email': 'viewer@test.com', 'clave': '123456'}

# LISTA DE ENDPOINTS A TESTEAR
ENDPOINTS = [
    '/inventario/',
    '/bibliografia/',
    '/grupos/',
    '/personal/',      # Requiere tratamiento especial (ID al final)
    '/proyectos/',
    '/institucion/',
    '/planificacion/',
    '/personas/',
    '/enumerativas/'   # Usualmente solo lectura
]

# === FUNCIONES DE UTILIDAD ===
def login(usuario, rol_esperado):
    """Obtiene el token logueando al usuario"""
    try:
        resp = requests.post(f"{BASE_URL}/login/", json=usuario)
        if resp.status_code == 200:
            token = resp.json().get('token')
            print(f"[OK] Login {rol_esperado}: Token obtenido.")
            return token
        else:
            print(f"[ERROR] Falló login {rol_esperado}: {resp.text}")
            return None
    except Exception as e:
        print(f"[FATAL] No se pudo conectar al servidor: {e}")
        return None

def test_endpoint(endpoint, token_admin, token_viewer):
    print(f"\n--- Probando ruta: {endpoint} ---")
    
    # 1. DEFINICIÓN DE URLs
    url_get = f"{BASE_URL}{endpoint}"
    url_post = url_get

    # CASO ESPECIAL: Personal requiere un número de operación en el POST
    if endpoint == '/personal/':
        url_post = f"{BASE_URL}{endpoint}1"
        print(f"    (Ajuste de ruta para POST: {url_post})")

    # ==========================================
    # 2. PRUEBA DE LECTURA (GET)
    # ==========================================
    headers_viewer = {'Authorization': f'Bearer {token_viewer}'}
    resp_get = requests.get(url_get, headers=headers_viewer)
    
    if resp_get.status_code == 200:
        print(f"   [✔] GET (Consulta): ACCESO PERMITIDO (200)")
    elif resp_get.status_code == 401:
        print(f"   [X] GET (Consulta): ERROR - Token rechazado (401)")
    else:
        print(f"   [?] GET (Consulta): Respuesta inesperada ({resp_get.status_code})")
        if resp_get.status_code == 422:
            print(f"       Detalle: {resp_get.text}")

    # ==========================================
    # 3. PRUEBA DE ESCRITURA (POST) - CONSULTA
    # ==========================================
    # El usuario consulta DEBE ser rechazado (403)
    resp_post_viewer = requests.post(url_post, json={}, headers=headers_viewer)

    if resp_post_viewer.status_code == 403:
        print(f"   [✔] POST (Consulta): BLOQUEADO CORRECTAMENTE (403)")
    elif resp_post_viewer.status_code == 405:
         print(f"   [-] POST (Consulta): Método no permitido (Ruta de solo lectura)")
    elif resp_post_viewer.status_code in [200, 201, 400, 500]:
        print(f"   [X] POST (Consulta): PELIGRO - Acceso permitido ({resp_post_viewer.status_code})")
    else:
        print(f"   [?] POST (Consulta): Estado {resp_post_viewer.status_code}")

    # ==========================================
    # 4. PRUEBA DE ESCRITURA (POST) - ADMIN
    # ==========================================
    # El admin DEBE pasar la seguridad
    # NOTA: Si recibes 500 o 400 es BUENO, significa que pasó la seguridad y falló por datos vacíos.
    headers_admin = {'Authorization': f'Bearer {token_admin}'}
    resp_post_admin = requests.post(url_post, json={}, headers=headers_admin)

    if resp_post_admin.status_code == 403:
        print(f"   [X] POST (Admin): ERROR - El admin fue bloqueado (403)")
    elif resp_post_admin.status_code == 405:
        print(f"   [✔] POST (Admin): Ruta de solo lectura (405) - OK")
    elif resp_post_admin.status_code in [200, 201, 400, 422, 500]:
        print(f"   [✔] POST (Admin): ACCESO PERMITIDO (Código {resp_post_admin.status_code} indica que pasó el check de rol)")
    else:
        print(f"   [?] POST (Admin): Respuesta inesperada {resp_post_admin.status_code}")

# === EJECUCIÓN ===
if __name__ == '__main__':
    print("=== INICIANDO BARRIDO DE SEGURIDAD ===\n")
    
    t_admin = login(USER_ADMIN, "ADMIN")
    t_viewer = login(USER_VIEWER, "CONSULTA")

    if t_admin and t_viewer:
        for ep in ENDPOINTS:
            test_endpoint(ep, t_admin, t_viewer)
    else:
        print("\nNo se pueden realizar las pruebas sin tokens válidos.")