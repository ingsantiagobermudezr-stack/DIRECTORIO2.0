from sqlalchemy import create_engine, text

# Connection string (admin user) - adjust if necessary
admin_url = 'postgresql+psycopg2://postgres:12345@localhost:5432/postgres'
engine = create_engine(admin_url, isolation_level='AUTOCOMMIT')

try:
    with engine.connect() as conn:
        conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'directorio'"))
        conn.execute(text("DROP DATABASE IF EXISTS directorio"))
        conn.execute(text("CREATE DATABASE directorio"))
    print('Database recreated successfully')
except Exception as e:
    print('Error:', e)
