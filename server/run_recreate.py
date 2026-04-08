import os
from sqlalchemy import create_engine, text

p = 'recreate_db.py'
with open(p, 'rb') as f:
    b = f.read()
# strip utf-8 bom if present
if b.startswith(b'\xef\xbb\bf'):
    b = b[3:]
# decode as latin-1 to preserve bytes
s = b.decode('latin-1')
# execute in a minimal globals
g = {}
exec(s, g)
print('run_recreate.py: executed')
