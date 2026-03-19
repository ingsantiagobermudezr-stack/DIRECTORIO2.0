import os
import pytest
from fastapi.testclient import TestClient

from api.main import app

client = TestClient(app)

def test_root():
    r = client.get('/')
    assert r.status_code == 200
    assert 'message' in r.json()

def test_get_marketplace():
    r = client.get('/api/marketplace')
    assert r.status_code == 200
    assert isinstance(r.json(), list)
