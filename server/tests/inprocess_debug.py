import traceback
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

def run():
    usuario_payload = {
        "nombre": "Debug",
        "apellido": "Usuario",
        "correo": "debug.user@example.com",
        "password": "DebugPass123!"
    }
    try:
        resp = client.post('/api/usuarios/', json=usuario_payload)
        print('STATUS', resp.status_code)
        print('BODY', resp.text)
    except Exception:
        traceback.print_exc()

if __name__ == '__main__':
    run()
