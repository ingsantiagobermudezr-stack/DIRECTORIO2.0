import psycopg2
import os

DSN = dict(
    host=os.getenv('POSTGRES_HOST', 'localhost'),
    port=os.getenv('POSTGRES_PORT', '5432'),
    dbname=os.getenv('POSTGRES_DB', 'directorio'),
    user=os.getenv('POSTGRES_USER', 'postgres'),
    password=os.getenv('POSTGRES_PASSWORD', 'Admin123'),
)

def run():
    conn = psycopg2.connect(host=DSN['host'], port=DSN['port'], dbname=DSN['dbname'], user=DSN['user'], password=DSN['password'])
    cur = conn.cursor()
    cur.execute("ALTER TABLE departamento ADD COLUMN IF NOT EXISTS id_pais INTEGER;")
    cur.execute("ALTER TABLE departamento ADD COLUMN IF NOT EXISTS codigo_iso VARCHAR(10);")
    # Add FK only if pais exists
    cur.execute("SELECT to_regclass('public.pais')")
    exists = cur.fetchone()[0]
    if exists:
        try:
            cur.execute("ALTER TABLE departamento DROP CONSTRAINT IF EXISTS departamento_id_pais_fkey;")
            cur.execute("ALTER TABLE departamento ADD CONSTRAINT departamento_id_pais_fkey FOREIGN KEY (id_pais) REFERENCES pais (id_pais) ON DELETE SET NULL;")
        except Exception:
            pass
    conn.commit()
    cur.close()
    conn.close()
    print('run_sql: Adjusted departamento schema')


if __name__ == '__main__':
    run()
