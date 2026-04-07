import requests

BASE_URL = 'http://127.0.0.1:5000/api/grados-academicos'

def run():
    print("🚀 TEST GRADOS ACADÉMICOS")

    # 1. Crear
    res = requests.post(f'{BASE_URL}/', json={"nombre": "Magister"})
    if res.status_code == 201:
        print(f"✅ Crear: OK. ID={res.json()['grado']['id']}")
        id_grado = res.json()['grado']['id']
    else:
        print("❌ Falló crear")
        return

    # 2. Listar
    res = requests.get(f'{BASE_URL}/')
    print(f"✅ Listar: {len(res.json())} grados encontrados.")

    # 3. Modificar
    res = requests.put(f'{BASE_URL}/{id_grado}', json={"nombre": "Magister Scientiae"})
    if res.json()['grado']['nombre'] == "Magister Scientiae":
        print("✅ Modificar: OK")
    else:
        print("❌ Falló modificar")

    # 4. Eliminar
    res = requests.delete(f'{BASE_URL}/{id_grado}')
    if res.status_code == 200:
        print("✅ Eliminar: OK")
    else:
        print("❌ Falló eliminar")

if __name__ == '__main__':
    run()