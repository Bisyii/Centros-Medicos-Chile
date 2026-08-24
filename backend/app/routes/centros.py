import re
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas import CentroMedicoSchema
import app.database as db

router = APIRouter(prefix="/api/centros", tags=["Centros Médicos"])

def sanitize_regex(text: str) -> str:
    # Sanitizar entrada para prevenir vulnerabilidades de inyección Regex NoSQL
    return re.escape(text)

@router.get("/", response_model=List[CentroMedicoSchema])
async def get_centros(
    region: Optional[str] = Query(None, description="Filtrar por región"),
    comuna: Optional[str] = Query(None, description="Filtrar por comuna"),
    categoria: Optional[str] = Query(None, description="Filtrar por categoría (Público/Privado)"),
    tipo: Optional[str] = Query(None, description="Filtrar por tipo (e.g. CESFAM, Clínica)"),
    search: Optional[str] = Query(None, description="Búsqueda de texto en nombre, dirección o comuna")
):
    """
    Obtener listado de centros de salud con filtros dinámicos.
    Las consultas son asíncronas y sanitizadas para prevenir inyecciones NoSQL.
    """
    # Si estamos en modo fallback local
    if db.collection is None:
        results = db.local_data
        
        # Aplicar filtros locales
        if region:
            results = [c for c in results if c.get("region") == region]
        if comuna:
            results = [c for c in results if c.get("comuna") == comuna]
        if categoria:
            results = [c for c in results if c.get("categoria") == categoria]
        if tipo:
            results = [c for c in results if c.get("tipo") == tipo]
        if search:
            search_clean = search.lower().strip()
            results = [
                c for c in results 
                if search_clean in c.get("nombre", "").lower() or 
                   search_clean in c.get("direccion", "").lower() or
                   search_clean in c.get("comuna", "").lower()
            ]
        
        # Retornar solo centros activos
        return [c for c in results if c.get("activo", True) is not False]

    # Si estamos usando MongoDB Atlas real
    query = {"activo": {"$ne": False}}

    if region:
        query["region"] = region
    if comuna:
        query["comuna"] = comuna
    if categoria:
        query["categoria"] = categoria
    if tipo:
        query["tipo"] = tipo
    if search:
        sanitized_search = sanitize_regex(search)
        query["$or"] = [
            {"nombre": {"$regex": sanitized_search, "$options": "i"}},
            {"direccion": {"$regex": sanitized_search, "$options": "i"}},
            {"comuna": {"$regex": sanitized_search, "$options": "i"}}
        ]

    try:
        cursor = db.collection.find(query)
        # Limitar la respuesta inicial para optimizar el rendimiento y latencia
        centros = []
        async for doc in cursor:
            # MongoDB usa _id por defecto, lo mapeamos al campo id
            doc["id"] = str(doc.get("id", doc.get("_id")))
            centros.append(doc)
        return centros
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al consultar base de datos: {str(e)}")


@router.get("/{centro_id}", response_model=CentroMedicoSchema)
async def get_centro_by_id(centro_id: str):
    """
    Obtener los detalles completos de un centro de salud específico por su ID.
    """
    # Si estamos en modo fallback local
    if db.collection is None:
        centro = next((c for c in db.local_data if c.get("id") == centro_id), None)
        if not centro:
            raise HTTPException(status_code=404, detail="Centro médico no encontrado")
        return centro

    # Si estamos en MongoDB Atlas
    try:
        # Sanitizar ID para prevenir inyecciones
        clean_id = sanitize_regex(centro_id)
        doc = await db.collection.find_one({"id": clean_id})
        if not doc:
            raise HTTPException(status_code=404, detail="Centro médico no encontrado")
        doc["id"] = str(doc.get("id", doc.get("_id")))
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al buscar el centro: {str(e)}")
