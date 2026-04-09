from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.db.conexion import get_db
from api.models.models import UsuarioFavorito, Marketplace
from api.schemas.schemas import UsuarioFavoritoResponse, UsuarioFavoritoResponseDetallado
from api.api.auth import get_current_user, require_permission
from seeders.seed_permisos import Permisos

router = APIRouter()


@router.get("/favoritos/usuario/", response_model=list[UsuarioFavoritoResponseDetallado])
async def listar_mis_favoritos(
    skip: int = 0,
    limit: int = 50,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Obtener lista de favoritos del usuario autenticado
    """
    query = select(UsuarioFavorito).where(
        and_(
            UsuarioFavorito.id_usuario == current_user["id"],
            UsuarioFavorito.deleted_at.is_(None)
        )
    ).options(
        joinedload(UsuarioFavorito.marketplace)
        .joinedload(Marketplace.empresa),
        joinedload(UsuarioFavorito.marketplace)
        .joinedload(Marketplace.categoria),
        joinedload(UsuarioFavorito.marketplace)
        .joinedload(Marketplace.estado)
    )
    
    result = await db.execute(query.offset(skip).limit(limit))
    return result.unique().scalars().all()


@router.get("/favoritos/usuario/contar/")
async def contar_favoritos(
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Contar cuántos favoritos tiene el usuario autenticado
    """
    query = select(UsuarioFavorito).where(
        and_(
            UsuarioFavorito.id_usuario == current_user["id"],
            UsuarioFavorito.deleted_at.is_(None)
        )
    )
    
    result = await db.execute(query)
    favoritos = result.scalars().all()
    
    return {"cantidad": len(favoritos)}


@router.get("/favoritos/usuario/verificar/{id_marketplace}")
async def verificar_favorito(
    id_marketplace: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Verificar si un producto está en favoritos del usuario
    """
    query = select(UsuarioFavorito).where(
        and_(
            UsuarioFavorito.id_usuario == current_user["id"],
            UsuarioFavorito.id_marketplace == id_marketplace,
            UsuarioFavorito.deleted_at.is_(None)
        )
    )
    
    result = await db.execute(query)
    favorito = result.scalars().first()
    
    return {"en_favoritos": favorito is not None}


@router.post("/favoritos/", response_model=UsuarioFavoritoResponse)
async def agregar_a_favoritos(
    id_marketplace: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Agregar un producto a favoritos del usuario autenticado
    """
    # Verificar que el producto existe y no está eliminado
    marketplace_query = select(Marketplace).where(
        and_(
            Marketplace.id == id_marketplace,
            Marketplace.deleted_at.is_(None)
        )
    )
    marketplace_result = await db.execute(marketplace_query)
    marketplace = marketplace_result.scalars().first()
    
    if not marketplace:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    # Verificar si ya está en favoritos
    existing_query = select(UsuarioFavorito).where(
        and_(
            UsuarioFavorito.id_usuario == current_user["id"],
            UsuarioFavorito.id_marketplace == id_marketplace,
            UsuarioFavorito.deleted_at.is_(None)
        )
    )
    existing_result = await db.execute(existing_query)
    existing = existing_result.scalars().first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Este producto ya está en tus favoritos")
    
    # Crear nuevo favorito
    favorito = UsuarioFavorito(
        id_usuario=current_user["id"],
        id_marketplace=id_marketplace
    )
    
    db.add(favorito)
    await db.commit()
    await db.refresh(favorito)
    
    return favorito


@router.delete("/favoritos/{id_marketplace}")
async def eliminar_de_favoritos(
    id_marketplace: int,
    current_user = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Eliminar un producto de favoritos del usuario autenticado
    """
    query = select(UsuarioFavorito).where(
        and_(
            UsuarioFavorito.id_usuario == current_user["id"],
            UsuarioFavorito.id_marketplace == id_marketplace,
            UsuarioFavorito.deleted_at.is_(None)
        )
    )
    
    result = await db.execute(query)
    favorito = result.scalars().first()
    
    if not favorito:
        raise HTTPException(status_code=404, detail="Favorito no encontrado")
    
    # Soft delete
    favorito.deleted_at = datetime.utcnow()
    await db.commit()
    
    return {"message": "Producto eliminado de favoritos"}


@router.get("/favoritos/", response_model=list[UsuarioFavoritoResponse])
async def listar_todos_favoritos(
    skip: int = 0,
    limit: int = 50,
    _: object = Depends(require_permission(Permisos.VER_REGISTROS_ELIMINADOS)),
    db: AsyncSession = Depends(get_db),
):
    """
    Listar TODOS los favoritos del sistema (solo admin)
    """
    query = select(UsuarioFavorito).where(UsuarioFavorito.deleted_at.is_(None))
    result = await db.execute(query.offset(skip).limit(limit))
    return result.scalars().all()
