p='recreate_db.py'
with open(p,'rb') as f:
    b=f.read()
print(repr(b[:40]))
print(b[:10])
