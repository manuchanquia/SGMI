"""
Script simple para iniciar Flask sin debug mode ni reloader
"""
import sys
import os

# Agregar el directorio BackEnd al path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import app

if __name__ == '__main__':
    print("=" * 60)
    print("Iniciando Flask en http://127.0.0.1:5000")
    print("Presiona CTRL+C para detener")
    print("=" * 60)
    app.run(host='127.0.0.1', port=5000, debug=False, use_reloader=False)
