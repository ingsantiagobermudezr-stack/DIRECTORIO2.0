# COMANDOS DEL PROYECTO

## 1. INSTALACIÓN DE DEPENDENCIAS
pip install -r requirements.txt

## 2. ACTIVACIÓN DEL ENTORNO VIRTUAL

WINDOWS (POWERSHELL)
.\venv\Scripts\Activate.ps1

LINUX / MAC
source .venv/bin/activate

## 3. BASE DE DATOS (ALEMBIC)

GENERAR UNA NUEVA MIGRACIÓN
alembic revision --autogenerate -m "mensaje de la migracion"

APLICAR MIGRACIONES
alembic upgrade head

VER ESTADO ACTUAL DE LA BASE DE DATOS
alembic current

## 4. VERIFICACIÓN DE CONEXIÓN A POSTGRESQL
python -c "from api.db.conexion import get_engine; print(get_engine())"

## 5. VER TABLAS CREADAS
python -c "from sqlalchemy import inspect; from api.db.conexion import get_engine; print(inspect(get_engine()).get_table_names())"

## 6. EJECUCIÓN DEL BACKEND (FASTAPI)
python -m uvicorn api.main:app --reload

## 7. DOCUMENTACIÓN DE LA API (SWAGGER)
http://127.0.0.1:8000/docs

## 8. EJECUCIÓN DEL FRONTEND
cd Frontend
npm install
npm run dev

## 9. FLUJO DE DESARROLLO RECOMENDADO

BACKEND
cd server
.\venv\Scripts\Activate.ps1
uvicorn api.main:app --reload

FRONTEND (EN OTRA TERMINAL)
cd Frontend
npm run dev