from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from api.schemas.schemas import EmpresaCreate, EmpresaResponse, EmpresaResponseGet
from api.models.models import Empresa, Categoria, Municipio
from api.db.conexion import get_db

router = APIRouter()

# Crear empresa
@router.post("/empresas/", response_model=EmpresaResponse)
def create_empresa(empresa: EmpresaCreate, db: Session = Depends(get_db)):
    try:
        # Verificar si existe la categoría
        categoria = db.query(Categoria).filter(Categoria.id_categoria == empresa.id_categoria).first()
        if not categoria:
            raise HTTPException(status_code=404, detail="La categoría especificada no existe")
        
        # Verificar si existe el municipio
        municipio = db.query(Municipio).filter(Municipio.id_municipio == empresa.id_municipio).first()
        if not municipio:
            raise HTTPException(status_code=404, detail="El municipio especificado no existe")
        
        # Crear la empresa
        db_empresa = Empresa(**empresa.dict())
        db.add(db_empresa)
        db.commit()
        db.refresh(db_empresa)
        return {"success": True, "id_empresa": db_empresa.id_empresa}
    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error al crear empresa: {str(e)}")
        raise HTTPException(status_code=400, detail="Error al crear la empresa. Verifica los datos proporcionados.")

# Leer todas las empresas
@router.get("/empresas/", response_model=list[EmpresaResponseGet])
def read_empresas(skip: int = 0, limit: int = 10,
    nombre: str | None = Query(default=None, description="Filtrar por nombre de empresa"),
    db: Session = Depends(get_db)):

    query = db.query(Empresa)

    if nombre:
        query = query.filter(Empresa.nombre.ilike(f"%{nombre}%"))

    query = query.options(joinedload(Empresa.categoria))
    query = query.options(joinedload(Empresa.municipio))

    
    print(query.all())
    return query.offset(skip).limit(limit).all()

# Leer una empresa específica
@router.get("/empresas/{empresa_id}", response_model=EmpresaResponseGet)
def read_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id_empresa == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    return empresa

# Actualizar una empresa
@router.put("/empresas/{empresa_id}", response_model=EmpresaResponseGet)
def update_empresa(empresa_id: int, empresa: EmpresaCreate, db: Session = Depends(get_db)):
    db_empresa = db.query(Empresa).filter(Empresa.id_empresa == empresa_id).first()
    if not db_empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    for key, value in empresa.dict().items():
        setattr(db_empresa, key, value)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

# Eliminar una empresa
@router.delete("/empresas/{empresa_id}")
def delete_empresa(empresa_id: int, db: Session = Depends(get_db)):
    empresa = db.query(Empresa).filter(Empresa.id_empresa == empresa_id).first()
    if not empresa:
        raise HTTPException(status_code=404, detail="Empresa no encontrada")
    db.delete(empresa)
    db.commit()
    return {"message": "Empresa eliminada correctamente"}
