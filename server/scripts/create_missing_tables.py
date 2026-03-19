from api.db import conexion
from sqlalchemy import text


def create_tables():
    eng = conexion.get_engine()
    sql = '''
CREATE TABLE IF NOT EXISTS departamento (
  id_departamento SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);
CREATE INDEX IF NOT EXISTS ix_departamento_id_departamento ON departamento (id_departamento);

CREATE TABLE IF NOT EXISTS municipio (
  id_municipio SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  id_departamento INTEGER REFERENCES departamento (id_departamento) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS ix_municipio_id_municipio ON municipio (id_municipio);
'''
    with eng.begin() as conn:
        conn.execute(text(sql))
    print('Tablas departamento y municipio creadas (si no existían).')


if __name__ == '__main__':
    create_tables()
