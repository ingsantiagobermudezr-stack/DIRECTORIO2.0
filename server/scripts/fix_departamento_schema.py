from api.db import conexion
from sqlalchemy import text


def fix_schema():
    eng = conexion.get_engine()
    sql = '''
ALTER TABLE departamento ADD COLUMN IF NOT EXISTS id_pais INTEGER;
-- añadir FK si existe la tabla pais
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_class WHERE relname='pais') THEN
        BEGIN
            ALTER TABLE departamento DROP CONSTRAINT IF EXISTS departamento_id_pais_fkey;
            ALTER TABLE departamento ADD CONSTRAINT departamento_id_pais_fkey FOREIGN KEY (id_pais) REFERENCES pais (id_pais) ON DELETE SET NULL;
        EXCEPTION WHEN others THEN
            -- ignore
        END;
    END IF;
END$$;
'''
    with eng.begin() as conn:
        conn.execute(text(sql))
    print('Esquema de departamento ajustado (id_pais + FK si aplicable).')


if __name__ == '__main__':
    fix_schema()
