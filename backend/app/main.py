from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import app.database as db
from app.routes.centros import router as centros_router

app = FastAPI(
    title="API Centros Médicos Chile",
    description="API REST asíncrona de alto rendimiento para búsqueda y consulta de centros médicos de Chile.",
    version="1.0.0"
)

# Configurar middleware CORS
# En producción, se debe limitar el acceso solo a los dominios autorizados del Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite acceso universal (ideal para modo API pública/B2B)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar base de datos al iniciar el servidor
@app.on_event("startup")
def startup_db_client():
    db.init_db()

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Bienvenido a la API Oficial de Centros Médicos de Chile",
        "docs": "/docs"
    }

# Incluir enrutadores
app.include_router(centros_router)
