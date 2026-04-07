"""
Script para ejecutar test con servidor Flask integrado
"""
import subprocess
import time
import sys
import os
import urllib.request
import urllib.error

def check_server():
    """Verifica si el servidor esta accesible"""
    try:
        with urllib.request.urlopen('http://127.0.0.1:5000/', timeout=2) as response:
            return True
    except:
        return False

def main():
    print("="*60)
    print("Test de Inventario con Servidor Flask")
    print("="*60)
    
    # Cambiar al directorio BackEnd
    backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
    os.chdir(backend_dir)
    
    # Iniciar servidor Flask en subprocess
    print("\n[1/3] Iniciando servidor Flask...")
    server_process = subprocess.Popen(
        [sys.executable, 'scripts/run_server_simple.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        cwd=backend_dir
    )
    
    # Esperar a que el servidor esté listo
    print("[2/3] Esperando a que el servidor esté listo...")
    max_attempts = 10
    for i in range(max_attempts):
        time.sleep(1)
        if check_server():
            print(f"      Servidor listo despues de {i+1} segundos")
            break
    else:
        print("[ERROR] Servidor no respondio despues de 10 segundos")
        server_process.terminate()
        return 1
    
    # Ejecutar test
    print("\n[3/3] Ejecutando tests...")
    print("-"*60)
    test_process = subprocess.run(
        [sys.executable, 'scripts/test_inventario_urllib.py'],
        cwd=backend_dir
    )
    
    # Detener servidor
    print("-"*60)
    print("\nDeteniendo servidor...")
    server_process.terminate()
    server_process.wait(timeout=5)
    
    print("="*60)
    print(f"Test completado con codigo: {test_process.returncode}")
    print("="*60)
    
    return test_process.returncode

if __name__ == '__main__':
    sys.exit(main())
