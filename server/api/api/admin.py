from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from api.db.conexion import get_db
from api.api.auth import require_admin
from api.models.models import Usuario, Empresa, Marketplace

router = APIRouter()


@router.get('/admin/dashboard')
async def admin_dashboard(db: AsyncSession = Depends(get_db), _=Depends(require_admin)):
    # Resumen básico de sistema para administradores
    total_usuarios = await db.scalar(select(func.count()).select_from(Usuario))
    total_empresas = await db.scalar(select(func.count()).select_from(Empresa))
    total_marketplace = await db.scalar(select(func.count()).select_from(Marketplace))

    return {
        'usuarios': total_usuarios,
        'empresas': total_empresas,
        'marketplace_items': total_marketplace,
    }
