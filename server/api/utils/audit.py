from sqlalchemy.orm import Session
from api.models.models import Auditoria
from datetime import datetime

def log_auditoria(db: Session, tabla: str, operacion: str, id_registro: int | None = None, id_usuario: int | None = None, descripcion: str | None = None):
    a = Auditoria(tabla=tabla, operacion=operacion, id_registro=id_registro, id_usuario=id_usuario, descripcion=descripcion, fecha=datetime.utcnow())
    db.add(a)
    db.commit()
    db.refresh(a)
    return a
