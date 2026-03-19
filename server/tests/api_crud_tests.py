import json
import time
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

BASE = 'http://127.0.0.1:8000'

def request(method, path, data=None):
    url = BASE + path
    body = None
    headers = {'Content-Type': 'application/json', 'Accept': 'application/json'}
    if data is not None:
        body = json.dumps(data).encode('utf-8')
    req = Request(url, data=body, headers=headers, method=method)
    try:
        with urlopen(req, timeout=10) as resp:
            code = resp.getcode()
            text = resp.read().decode('utf-8')
            try:
                return code, json.loads(text)
            except Exception:
                return code, text
    except HTTPError as e:
        try:
            body = e.read().decode('utf-8')
            try:
                body = json.loads(body)
            except Exception:
                pass
        except Exception:
            body = e.reason
        return e.code, body
    except URLError as e:
        return None, f'URLError: {e}'

def main():
    ts = int(time.time())

    # 1) Usuarios: crear -> obtener -> actualizar -> eliminar
    usuario_payload = {
        "nombre": "Test",
        "apellido": "Usuario",
        "correo": f"test.user.{ts}@example.com",
        "password": "TestPass123!"
    }
    code, data = request('POST', '/api/usuarios/', usuario_payload)
    print('CREATE usuario', code, data)
    if not (isinstance(code, int) and code < 300):
        raise SystemExit('Fallo creación usuario')

    # 2) Signin (usar /api/signin)
    signin_payload = {"correo": usuario_payload['correo'], "password": usuario_payload['password']}
    code, data = request('POST', '/api/signin', signin_payload)
    print('SIGNIN', code, data)
    if not (isinstance(code, int) and code < 300):
        raise SystemExit('Fallo signin')

    # 3) Empresas: crear -> update -> delete
    empresa_payload = {
        "nombre": f"Empresa Test {ts}",
        "nit": f"NIT{ts}",
        "correo": "empresa.test@example.com",
        "direccion": "Calle Test 123",
        "telefono": "3000000000",
        "id_categoria": 4,
        "id_municipio": 1,
        "logo": ""
    }
    code, data = request('POST', '/api/empresas/', empresa_payload)
    print('CREATE empresa', code, data)
    if not (isinstance(code, int) and code < 300):
        raise SystemExit('Fallo creación empresa')
    empresa_id = data.get('id_empresa') if isinstance(data, dict) else None

    # Intentar crear empresa con mismo NIT — debe fallar (409)
    code_dup, data_dup = request('POST', '/api/empresas/', empresa_payload)
    print('CREATE empresa duplicate', code_dup, data_dup)
    if not (isinstance(code_dup, int) and code_dup >= 400):
        raise SystemExit('Fallo: duplicado de NIT fue permitido')

    # 4) Marketplace: crear -> update -> delete (usar empresa_id si existe)
    marketplace_payload = {
        "nombre": "Producto Test",
        "descripcion": "Descripción",
        "precio": 10.5,
        "imagen_url": "",
        "estado": "activo",
        "id_empresa": empresa_id or 1,
        "id_categoria": 4
    }
    code, data = request('POST', '/api/marketplace', marketplace_payload)
    print('CREATE marketplace', code, data)
    if not (isinstance(code, int) and code < 300):
        raise SystemExit('Fallo creación marketplace')
    mp_id = data.get('id_marketplace') if isinstance(data, dict) else None

    # Actualizar marketplace
    update_payload = {**marketplace_payload, 'nombre': 'Producto Test Modificado'}
    code, data = request('PUT', f'/api/marketplace/{mp_id}', update_payload)
    print('UPDATE marketplace', code, data)
    if not (isinstance(code, int) and code < 300):
        raise SystemExit('Fallo update marketplace')

    # Eliminar marketplace
    code, data = request('DELETE', f'/api/marketplace/{mp_id}')
    print('DELETE marketplace', code, data)

    # Eliminar empresa
    if empresa_id:
        code, data = request('DELETE', f'/api/empresas/{empresa_id}')
        print('DELETE empresa', code, data)

    # Eliminar usuario: buscar su id por listado y eliminar
    code, users = request('GET', '/api/usuarios/')
    uid = None
    if isinstance(users, list):
        for u in users:
            if u.get('correo') == usuario_payload['correo']:
                uid = u.get('id_usuario')
                break
    if uid:
        code, data = request('DELETE', f'/api/usuarios/{uid}')
        print('DELETE usuario', code, data)

    print('\nCRUD tests completadas correctamente')

if __name__ == '__main__':
    main()
