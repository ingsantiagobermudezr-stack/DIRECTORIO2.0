# coding: latin-1
from sqlalchemy import create_engine, text
import os
from dotenv import load_dotenv

load_dotenv()
# Connect to postgres to create/drop the database
# Use psycopg2 driver for Windows compatibility
admin_url = "postgresql+psycopg2://postgres:12345@localhost:5432/postgres"
engine = create_engine(admin_url, isolation_level="AUTOCOMMIT")  # Importante: AUTOCOMMIT

try:
    with engine.connect() as conn:
        # First try to terminate connections to the database
        conn.execute(text("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'directorio'"))
    
    with engine.connect() as conn:
        # Now drop the database if it exists
        conn.execute(text("DROP DATABASE IF EXISTS directorio"))
    
    with engine.connect() as conn:
        # Finally create the new database
        conn.execute(text("CREATE DATABASE directorio"))
        print("Database 'directorio' created successfully")

except Exception as e:
    print(f"Error: {str(e)}")
