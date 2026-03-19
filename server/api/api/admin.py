from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from api.db.conexion import get_db
from api.api.auth import require_admin
from api.models.models import Usuario, Empresa, Producto, Marketplace, Auditoria

router = APIRouter()


@router.get('/admin/dashboard')
def admin_dashboard(db: Session = Depends(get_db), _=Depends(require_admin)):
    # Resumen básico de sistema para administradores
    total_usuarios = db.query(Usuario).count()
    total_empresas = db.query(Empresa).count()
    total_productos = db.query(Producto).count()
    total_marketplace = db.query(Marketplace).count()
    recent_audit = db.query(Auditoria).order_by(Auditoria.fecha.desc()).limit(10).all()

    return {
        'usuarios': total_usuarios,
        'empresas': total_empresas,
        'productos': total_productos,
        'marketplace_items': total_marketplace,
        'recent_audit': [ { 'id': a.id_auditoria, 'tabla': a.tabla, 'operacion': a.operacion, 'fecha': a.fecha } for a in recent_audit ]
    }
