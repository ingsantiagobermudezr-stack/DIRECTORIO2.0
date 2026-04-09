from fastapi import APIRouter, Depends, Query
from typing import Optional
from sqlalchemy import select, or_, and_
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from api.db.conexion import get_db
from api.models.models import Empresa, Marketplace, Categoria, Municipio
from api.api.auth import can_view_deleted_records

router = APIRouter()


@router.get("/busqueda/global/")
async def busqueda_global(
    query: str = Query(..., min_length=2, max_length=100),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db)
):
    """
    Búsqueda global en empresas y marketplace con un solo query
    
    Busca en:
    - Empresas: nombre, correo
    - Marketplace: nombre, descripción
    
    Query: ?query=laptop (mínimo 2 caracteres, máximo 100)
    """
    search_term = f"%{query}%"
    
    # Búsqueda en empresas
    empresa_filters = [Empresa.nombre.ilike(search_term) | Empresa.correo.ilike(search_term)]
    if not can_view_deleted:
        empresa_filters.append(Empresa.deleted_at.is_(None))
    
    empresa_query = select(Empresa).options(
        joinedload(Empresa.categoria),
        joinedload(Empresa.municipio)
    ).where(and_(*empresa_filters)).offset(skip).limit(limit)
    
    empresa_result = await db.execute(empresa_query)
    empresas = empresa_result.scalars().unique().all()
    
    # Búsqueda en marketplace
    marketplace_filters = [
        or_(
            Marketplace.nombre.ilike(search_term),
            Marketplace.descripcion.ilike(search_term)
        )
    ]
    if not can_view_deleted:
        marketplace_filters.append(Marketplace.deleted_at.is_(None))
    
    marketplace_query = select(Marketplace).options(
        joinedload(Marketplace.categoria),
        joinedload(Marketplace.empresa),
        joinedload(Marketplace.estado)
    ).where(and_(*marketplace_filters)).offset(skip).limit(limit)
    
    marketplace_result = await db.execute(marketplace_query)
    productos = marketplace_result.scalars().unique().all()
    
    return {
        "query": query,
        "total_empresas": len(empresas),
        "total_productos": len(productos),
        "empresas": [
            {
                "id": e.id,
                "nombre": e.nombre,
                "nit": e.nit,
                "correo": e.correo,
                "direccion": e.direccion,
                "telefono": e.telefono,
                "logo_url": e.logo_url,
                "categoria": {"id": e.categoria.id, "nombre": e.categoria.nombre} if e.categoria else None,
                "municipio": {"id": e.municipio.id, "nombre": e.municipio.nombre} if e.municipio else None,
                "tipo": "empresa"
            }
            for e in empresas
        ],
        "productos": [
            {
                "id": p.id,
                "nombre": p.nombre,
                "descripcion": p.descripcion,
                "precio": p.precio,
                "stock": p.stock,
                "fecha_publicacion": p.fecha_publicacion,
                "categoria": {"id": p.categoria.id, "nombre": p.categoria.nombre} if p.categoria else None,
                "empresa": {"id": p.empresa.id, "nombre": p.empresa.nombre} if p.empresa else None,
                "estado": {"id": p.estado.id, "nombre": p.estado.nombre} if p.estado else None,
                "tipo": "producto"
            }
            for p in productos
        ]
    }


@router.get("/busqueda/sugerencias/")
async def sugerencias_busqueda(
    query: str = Query(..., min_length=1, max_length=50),
    limit: int = Query(10, ge=1, le=50),
    can_view_deleted: bool = Depends(can_view_deleted_records),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener sugerencias de búsqueda basadas en empresas y productos
    Útil para autocompletar en la barra de búsqueda
    """
    search_term = f"%{query}%"
    
    # Sugerencias de empresas
    empresa_filters = [Empresa.nombre.ilike(search_term)]
    if not can_view_deleted:
        empresa_filters.append(Empresa.deleted_at.is_(None))
    
    empresa_query = select(Empresa.nombre.label("text")).where(
        and_(*empresa_filters)
    ).distinct().limit(limit)
    
    empresa_result = await db.execute(empresa_query)
    empresa_sugerencias = [row[0] for row in empresa_result.all()]
    
    # Sugerencias de productos
    marketplace_filters = [Marketplace.nombre.ilike(search_term)]
    if not can_view_deleted:
        marketplace_filters.append(Marketplace.deleted_at.is_(None))
    
    marketplace_query = select(Marketplace.nombre.label("text")).where(
        and_(*marketplace_filters)
    ).distinct().limit(limit)
    
    marketplace_result = await db.execute(marketplace_query)
    producto_sugerencias = [row[0] for row in marketplace_result.all()]
    
    # Combinar y limitar
    sugerencias = list(set(empresa_sugerencias + producto_sugerencias))[:limit]
    
    return {
        "query": query,
        "sugerencias": sugerencias,
        "cantidad": len(sugerencias)
    }
