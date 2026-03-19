import httpx

def check(url):
    try:
        r = httpx.get(url, timeout=5)
        text = r.text[:800].replace('\n', ' ')[:800]
        print(f"{url} -> {r.status_code}\n{text}\n---")
    except Exception as e:
        print(f"{url} -> ERROR: {e}\n---")

if __name__ == '__main__':
    print('Comprobando backend endpoints...')
    check('http://127.0.0.1:8000/api/marketplace')
    check('http://127.0.0.1:8000/api/admin/dashboard')
    print('Comprobando frontend (puertos comunes)...')
    check('http://127.0.0.1:3000')
    check('http://127.0.0.1:5173')
