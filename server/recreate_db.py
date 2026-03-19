from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
# Conectar a postgres para poder crear/eliminar bases de datos
admin_url = "postgresql+psycopg://postgres:12345@localhost:5432/postgres"
engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")  # Importante: AUTOCOMMIT

try:
    with engine.connect() as conn:
        # Primero intentamos desconectar usuarios
        conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'directorio'"))
    
    with engine.connect() as conn:
        # Ahora podemos eliminar la base de datos
        conn.execute(text("DROP DATABASE IF EXISTS directorio"))
    
    with engine.connect() as conn:
        # Finalmente crear la nueva base de datos
        conn.execute(text("CREATE DATABASE directorio"))
        print("Base de datos 'directorio' creada exitosamente")

except Exception as e:
    print(f"Error: {str(e)}")
