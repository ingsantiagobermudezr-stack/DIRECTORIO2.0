import os, sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
try:
    import api.db.conexion as c
    print('SQLALCHEMY_DATABASE_URL =', repr(c.SQLALCHEMY_DATABASE_URL))
except Exception as e:
    import traceback
    print('ERROR importing api.db.conexion:', type(e).__name__, e)
    traceback.print_exc()
