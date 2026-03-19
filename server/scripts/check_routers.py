import os
import sys

# Asegurar que el directorio `server` (padre de este script) está en sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

modules = [
    "api.api.auth",
    "api.api.categorias",
    "api.api.departamentos",
    "api.api.empresas",
    "api.api.municipios",
    "api.api.publicidad",
    "api.api.resultados",
    "api.api.review",
    "api.api.usuarios",
    "api.api.marketplace",
]

for m in modules:
    try:
        mod = __import__(m, fromlist=['router'])
        print(m, 'OK', 'router' in dir(mod))
    except Exception as e:
        print(m, 'ERROR', type(e).__name__, str(e))
