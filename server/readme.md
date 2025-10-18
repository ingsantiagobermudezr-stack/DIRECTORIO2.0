## Instalación de dependencias

pip install -r requirements.txt

## Para generar una nueva migración de la bd

alembic revision --autogenerate -m "se agrego columna roles y se modifico columna telefono"

## Para activar la última migración

alembic upgrade head

## Ingresar al ambiente de desarollo

source .venv/bin/activate # En Linux/Mac
venv\Scripts\activate # En Windows
solo si es que se trabaja en un entorno virtual

## Comando para iniciar la aplicación

uvicorn api.main:app --reload --app-dir server
