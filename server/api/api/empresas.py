from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select, and_, or_, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload
from typing import Optional

from api.schemas.schemas import EmpresaCreate, EmpresaResponse, EmpresaResponseGet
from api.models.models import Empresa, Categoria, Municipio, Review
from api.db.conexion import get_db
from api.api.auth import can_view_deleted_records, require_permission, get_current_user_optional, is_admin_user
from api.utils.uploads import ensure_upload_dir, save_upload_file, build_public_url, get_upload_root
from seeders.seed_permisos import Permisos
from pathlib import Path
from fastapi.responses import FileResponse

router = APIRouter()


def _is_admin(user) -> bool:
    return is_admin_user(user)


def _assert_empresa_owner_or_admin(user, empresa: Empresa) -> None:
    if _is_admin(user):
        return
    if empresa.id_usuario_creador != user.id:
        raise HTTPException(status_code=403, detail="Solo el creador o admin puede modificar esta empresa")

# Crear empresa
@router.post("/empresas/", response_model=EmpresaResponse, status_code=201)
async def create_empresa(
    empresa: EmpresaCreate,
    current_user = Depends(require_permission(Permisos.CREAR_EMPRESA)),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Verificar unicidad de NIT
        nit_result = await db.execute(select(Empresa).where(Empresa.nit == empresa.nit))
        existing_nit = nit_result.scalars().first()
        if existing_nit:
            raise HTTPException(status_code=409, detail="Ya existe una empresa con este NIT")

        # Verificar si existe la categoría
        categoria_result = await db.execute(select(Categoria).where(Categoria.id == empresa.id_categoria))
        categoria = categoria_result.scalars().first()
        if not categoria:
            raise HTTPException(status_code=404, detail="La categoría especificada no existe")
        
        # Verificar si existe el municipio
        municipio_result = await db.execute(select(Municipio).where(Municipio.id == empresa.id_municipio))
        municipio = municipio_result.scalars().first()
        if not municipio:
            raise HTTPException(status_code=404, detail="El municipio especificado no existe")
        
        # Crear la empresa
        db_empresa = Empresa(**empresa.model_dump())
        db.add(db_empresa)
        await db.commit()
        await db.refresh(db_empresa)
        return {"success": True, "id": db_empresa.id}
    except HTTPException as he:
        raise he
    except IntegrityError as ie:
        await db.rollback()
        raise HTTPException(status_code=409, detail="Conflicto al crear empresa: posible NIT duplicado")
    except Exception as e:
        # Rollback y normalizar como conflicto de NIT (evita exponer detalles DB)
        try:
            await db.rollback()
        except Exception:
            pass
        print(f"Error al crear empresa: {str(e)}")
        raise HTTPException(status_code=409, detail="Conflicto al crear empresa: posible NIT duplicado")

# Leer todas las empresas
@router.get("/empresas/", response_model=list[EmpresaResponseGet])
async def read_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    nombre: Optional[str] = Query(None),
    id_categoria: Optional[int] = Query(None),
    id_municipio: Optional[int] = Query(None),
    rating_min: Optional[float] = Query(None, ge=0, le=5),
    search: Optional[str] = Query(None),
    ordenar: Optional[str] = Query("nombre", regex="^(nombre|rating)$"),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db)
):
    """
    Leer empresas con filtros avanzados
    - search: Busca en nombre y correo
    - nombre: Filtro simple por nombre
    - id_categoria: Filtrar por categoría
    - id_municipio: Filtrar por municipio/ubicación
    - rating_min: Filtrar por calificación promedio mínima (0-5)
    - ordenar: Ordenar por nombre (asc) o rating (desc)
    """
    # Calcular promedio de calificación por empresa
    avg_rating = select(
        Review.id_empresa,
        func.avg(Review.calificacion).label("avg_rating")
    ).where(Review.deleted_at.is_(None)).group_by(Review.id_empresa).subquery()
    
    query = select(Empresa).options(
        joinedload(Empresa.categoria),
        joinedload(Empresa.municipio)
    ).outerjoin(avg_rating, Empresa.id == avg_rating.c.id_empresa)

    filters = []
    if not can_view_deleted:
        filters.append(Empresa.deleted_at.is_(None))

    if nombre:
        filters.append(Empresa.nombre.ilike(f"%{nombre}%"))
    
    if search:
        search_filter = or_(
            Empresa.nombre.ilike(f"%{search}%"),
            Empresa.correo.ilike(f"%{search}%")
        )
        filters.append(search_filter)

    if id_categoria:
        filters.append(Empresa.id_categoria == id_categoria)
    
    if id_municipio:
        filters.append(Empresa.id_municipio == id_municipio)
    
    if rating_min is not None:
        filters.append(func.coalesce(avg_rating.c.avg_rating, 0) >= rating_min)

    if filters:
        query = query.where(and_(*filters))

    # Ordenamiento
    if ordenar == "rating":
        query = query.order_by(func.coalesce(avg_rating.c.avg_rating, 0).desc())
    else:
        query = query.order_by(Empresa.nombre.asc())

    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().unique().all()

# Mis empresas (para usuario autenticado)
@router.get("/empresas/usuario/mis-empresas", response_model=list[EmpresaResponseGet])
async def get_mis_empresas(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    """Obtener mis empresas como creador"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Debe estar autenticado")
    
    query = select(Empresa).options(
        joinedload(Empresa.categoria),
        joinedload(Empresa.municipio)
    ).where(Empresa.id_usuario_creador == current_user.id)
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().unique().all()

# Leer una empresa específica
@router.get("/empresas/{empresa_id}", response_model=EmpresaResponseGet)
async def read_empresa(
    empresa_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = (
        select(Empresa)
        .options(joinedload(Empresa.categoria), joinedload(Empresa.municipio))
        .where(Empresa.id == empresa_id)
    )
    if not can_view_deleted:
        query = query.where(Empresa.deleted_at.is_(None))
    result = await db.execute(query)
    empresa = result.scalars().first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

# Actualizar una empresa
@router.put("/empresas/{empresa_id}", response_model=EmpresaResponseGet)
async def update_empresa(
    empresa_id: int,
    empresa: EmpresaCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_EMPRESAS)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
    db_empresa = result.scalars().first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    _assert_empresa_owner_or_admin(current_user, db_empresa)

    for key, value in empresa.model_dump().items():
        setattr(db_empresa, key, value)
    await db.commit()
    result = await db.execute(
        select(Empresa)
        .options(joinedload(Empresa.categoria), joinedload(Empresa.municipio))
        .where(Empresa.id == empresa_id)
    )
    empresa_actualizada = result.scalars().first()
    return empresa_actualizada

# Eliminar una empresa
@router.delete("/empresas/{empresa_id}")
async def delete_empresa(
    empresa_id: int,
    current_user = Depends(require_permission(Permisos.MODIFICAR_EMPRESAS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
    empresa = result.scalars().first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    _assert_empresa_owner_or_admin(current_user, empresa)

    empresa.deleted_at = datetime.utcnow()
    await db.commit()
    return {"message": "Empresa desactivada correctamente"}


@router.patch("/empresas/{empresa_id}/restore")
async def restore_empresa(
    empresa_id: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Empresa).where(Empresa.id == empresa_id))
    empresa = result.scalars().first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    empresa.deleted_at = None
    await db.commit()
    return {"message": "Empresa restaurada correctamente"}


@router.post("/empresas/{empresa_id}/logo/upload")
async def upload_logo_empresa(
    empresa_id: int,
    archivo: UploadFile = File(...),
    current_user = Depends(require_permission(Permisos.MODIFICAR_EMPRESAS)),
    db: AsyncSession = Depends(get_db),
):
    """Sube logo de empresa y actualiza `logo_url`."""
    result = await db.execute(select(Empresa).where(Empresa.id == empresa_id, Empresa.deleted_at.is_(None)))
    empresa = result.scalars().first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")

    _assert_empresa_owner_or_admin(current_user, empresa)

    upload_dir = ensure_upload_dir(get_upload_root(), "empresas")
    file_name = await save_upload_file(archivo, upload_dir)
    empresa.logo_url = build_public_url(file_name, "empresas")

    await db.commit()
    await db.refresh(empresa)

    return {
        "message": "Logo subido correctamente",
        "empresa_id": empresa.id,
        "logo_url": empresa.logo_url,
    }

@router.get("/empresas/{empresa_id}/logo")
async def get_logo_empresa(
    empresa_id: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    """Retorna el archivo del logo de la empresa."""

    query = select(Empresa.logo_url).where(Empresa.id == empresa_id)
    if not can_view_deleted:
        query = query.where(Empresa.deleted_at.is_(None))

    result = await db.execute(query)
    logo_url = result.scalars().first()

    if not logo_url:
        raise HTTPException(status_code=404, detail="Empresa o logo no encontrado")

    # logo_url suele venir como URL pública, tomamos solo el nombre del archivo
    file_name = Path(logo_url).name
    file_path = Path(get_upload_root()) / "empresas" / file_name

    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="Archivo de logo no encontrado")

    return FileResponse(path=str(file_path), filename=file_name)