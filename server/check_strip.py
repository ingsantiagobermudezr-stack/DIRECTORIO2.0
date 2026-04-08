p='recreate_db.py'
with open(p,'rb') as f:
    b=f.read()
print('startswith BOM:', b.startswith(b'\xef\xbb\bf'))
if b.startswith(b'\xef\xbb\bf'):
    b=b[3:]
try:
    s=b.decode('latin-1')
    print('decoded repr start:', repr(s[:40]))
except Exception as e:
    print('decode error', e)
