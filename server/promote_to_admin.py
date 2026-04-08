from api.db.conexion import get_engine, SessionLocal
from api.models.models import Usuario, Rol

engine = get_engine()
SessionLocal.configure(bind=engine)
db = SessionLocal()

email = 'test@example.com'
user = db.query(Usuario).filter(Usuario.correo == email).first()
if not user:
    print('ERROR: user not found')
else:
    role = db.query(Rol).filter(Rol.nombre == 'admin').first()
    if not role:
        role = Rol(nombre='admin', descripcion='Administrator')
        db.add(role)
        db.commit()
        db.refresh(role)
    user.rol = 'admin'
    user.id_rol = role.id_rol
    db.add(user)
    db.commit()
    print(f'User {email} promoted to admin (id_rol={role.id_rol})')
