import urllib.request
import urllib.parse
import json

# Endpoint para obtener datos del grupo 2 
url = "http://localhost:5000/api/experto/grupo/2"

print(f"Consultando: {url}\n")

try:
    with urllib.request.urlopen(url) as response:
        data = json.loads(response.read().decode())
        print(f"Status: {response.status}")
        print(f"\n{json.dumps(data, indent=2, ensure_ascii=False)}")
except Exception as e:
    print(f"Error: {e}")
