import json
import sys
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError

BASE = 'http://127.0.0.1:8000'
ENDPOINTS = [
    ('root', '/'),
    ('marketplace_list', '/api/marketplace'),
    ('empresas_list', '/api/empresas/'),
    ('usuarios_list', '/api/usuarios/'),
]

def fetch(path):
    url = BASE + path
    req = Request(url, headers={'Accept': 'application/json'})
    try:
        with urlopen(req, timeout=5) as resp:
            code = resp.getcode()
            body = resp.read().decode('utf-8')
            try:
                data = json.loads(body)
            except Exception:
                data = body
            return code, data
    except HTTPError as e:
        return e.code, str(e)
    except URLError as e:
        return None, f'URLError: {e}'
    except Exception as e:
        return None, f'Error: {e}'

def main():
    ok = True
    for name, path in ENDPOINTS:
        code, data = fetch(path)
        print(f'[{name}] {path} -> status={code}')
        if isinstance(data, (dict, list)):
            print(json.dumps(data, indent=2, ensure_ascii=False))
        else:
            print(data)
        if code is None or (isinstance(code, int) and code >= 400):
            ok = False
    if not ok:
        print('\nUno o más endpoints fallaron.')
        sys.exit(2)
    print('\nTodos los endpoints respondieron correctamente (status < 400).')

if __name__ == '__main__':
    main()
