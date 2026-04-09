from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy import select, and_, or_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.db.conexion import get_db
from api.models.models import Marketplace, Empresa, ImagenMarketplace
from api.schemas.schemas import MarketplaceCreate, MarketplaceResponse
from api.api.auth import can_view_deleted_records, require_permission, get_current_user_optional
from api.utils.uploads import ensure_upload_dir, save_upload_file, build_public_url, get_upload_root
from seeders.seed_permisos import Permisos

router = APIRouter()

# Listar productos/servicios marketplace con filtros
@router.get("/marketplace", response_model=List[MarketplaceResponse])
async def get_marketplace(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    id_categoria: Optional[int] = Query(None),
    id_empresa: Optional[int] = Query(None),
    precio_min: Optional[float] = Query(None, ge=0),
    precio_max: Optional[float] = Query(None, ge=0),
    id_estado: Optional[int] = Query(None),
    search: Optional[str] = Query(None),
    ordenar: Optional[str] = Query("fecha_publicacion", regex="^(fecha_publicacion|precio|nombre)$"),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    """
    Listar productos/servicios con filtros avanzados
    - search: Busca en nombre y descripción
    - id_categoria: Filtrar por categoría
    - id_empresa: Filtrar por empresa
    - precio_min/precio_max: Rango de precios
    - id_estado: Filtrar por estado
    - ordenar: Ordenar por fecha_publicacion (desc), precio (asc) o nombre (asc)
    """
    query = select(Marketplace).options(joinedload(Marketplace.empresa), joinedload(Marketplace.categoria))
    
    filters = []
    if not can_view_deleted:
        filters.append(Marketplace.deleted_at.is_(None))
    
    if id_categoria:
        filters.append(Marketplace.id_categoria == id_categoria)
    
    if id_empresa:
        filters.append(Marketplace.id_empresa == id_empresa)
    
    if precio_min is not None:
        filters.append(Marketplace.precio >= precio_min)
    
    if precio_max is not None:
        filters.append(Marketplace.precio <= precio_max)
    
    if id_estado:
        filters.append(Marketplace.id_estado == id_estado)
    
    if search:
        search_filter = or_(
            Marketplace.nombre.ilike(f"%{search}%"),
            Marketplace.descripcion.ilike(f"%{search}%")
        )
        filters.append(search_filter)
    
    if filters:
        query = query.where(and_(*filters))
    
    # Ordenamiento
    if ordenar == "precio":
        query = query.order_by(Marketplace.precio.asc())
    elif ordenar == "nombre":
        query = query.order_by(Marketplace.nombre.asc())
    else:
        query = query.order_by(Marketplace.fecha_publicacion.desc())
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().unique().all()

# Obtener producto/servicio por ID
@router.get("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
async def get_marketplace_item(
    id_marketplace: int,
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db),
):
    query = select(Marketplace).options(
        joinedload(Marketplace.empresa),
        joinedload(Marketplace.categoria),
        joinedload(Marketplace.estado)
    ).where(Marketplace.id == id_marketplace)
    if not can_view_deleted:
        query = query.where(Marketplace.deleted_at.is_(None))
    result = await db.execute(query)
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    return item

# Mis productos (para usuario autenticado)
@router.get("/marketplace/usuario/mis-productos", response_model=List[MarketplaceResponse])
async def get_mis_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db),
):
    """Obtener mis productos como vendedor"""
    if not current_user:
        raise HTTPException(status_code=401, detail="Debe estar autenticado")
    
    # Obtener empresas del usuario
    result = await db.execute(
        select(Empresa).where(Empresa.id_usuario_creador == current_user.id)
    )
    empresas = result.scalars().all()
    empresa_ids = [e.id for e in empresas]
    
    if not empresa_ids:
        return []
    
    query = select(Marketplace).options(
        joinedload(Marketplace.empresa),
        joinedload(Marketplace.categoria)
    ).where(Marketplace.id_empresa.in_(empresa_ids))
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().unique().all()

# Crear producto/servicio
@router.post("/marketplace", response_model=MarketplaceResponse, status_code=201)
async def create_marketplace(
    item: MarketplaceCreate,
    current_user = Depends(require_permission(Permisos.CREAR_MARKETPLACE)),
    db: AsyncSession = Depends(get_db)
):
    db_item = Marketplace(**item.model_dump())
    db.add(db_item)
    await db.commit()
    await db.refresh(db_item)
    return db_item

# Editar producto/servicio
@router.put("/marketplace/{id_marketplace}", response_model=MarketplaceResponse)
async def update_marketplace(
    id_marketplace: int,
    item: MarketplaceCreate,
    current_user = Depends(require_permission(Permisos.MODIFICAR_MARKETPLACE)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    for key, value in item.model_dump().items():
        setattr(db_item, key, value)
    await db.commit()
    await db.refresh(db_item)
    return db_item

# Eliminar producto/servicio
@router.delete("/marketplace/{id_marketplace}")
async def delete_marketplace(
    id_marketplace: int,
    current_user = Depends(require_permission(Permisos.MODIFICAR_MARKETPLACE)),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    db_item = result.scalars().first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")
    db_item.deleted_at = datetime.utcnow()
    await db.commit()
    return {"detail": "Marketplace item deactivated"}


@router.patch("/marketplace/{id_marketplace}/restore")
async def restore_marketplace(
    id_marketplace: int,
    _: object = Depends(require_permission(Permisos.RESTAURAR_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Marketplace).where(Marketplace.id == id_marketplace))
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")

    item.deleted_at = None
    await db.commit()
    return {"detail": "Marketplace item restored"}


@router.post("/marketplace/{id_marketplace}/imagenes/upload")
async def upload_marketplace_images(
    id_marketplace: int,
    archivos: list[UploadFile] = File(...),
    _: object = Depends(require_permission(Permisos.MODIFICAR_MARKETPLACE)),
    db: AsyncSession = Depends(get_db),
):
    """Sube una o varias imágenes para un producto de marketplace."""
    if not archivos:
        raise HTTPException(status_code=400, detail="Debe enviar al menos un archivo")

    result = await db.execute(
        select(Marketplace).where(Marketplace.id == id_marketplace, Marketplace.deleted_at.is_(None))
    )
    item = result.scalars().first()
    if not item:
        raise HTTPException(status_code=404, detail="Marketplace item not found")

    upload_dir = ensure_upload_dir(get_upload_root(), "marketplace")
    uploaded_urls: list[str] = []

    for archivo in archivos:
        file_name = await save_upload_file(archivo, upload_dir)
        image_url = build_public_url(file_name, "marketplace")
        db.add(ImagenMarketplace(id_marketplace=id_marketplace, imagen_url=image_url))
        uploaded_urls.append(image_url)

    await db.commit()

    return {
        "message": "Imágenes subidas correctamente",
        "id_marketplace": id_marketplace,
        "imagenes": uploaded_urls,
    }
