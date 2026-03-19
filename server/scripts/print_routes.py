from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)
print('ROUTES:')
for r in app.router.routes:
    print(r.path)

print('\nRegistered endpoints done')