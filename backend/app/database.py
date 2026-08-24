import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mongodb_uri: str = os.environ.get("MONGODB_URI", "")
    database_name: str = "centros_medicos_db"
    collection_name: str = "centros"

    class Config:
        env_file = ".env"

settings = Settings()

# Cliente de base de datos MongoDB asíncrono
client = None
db = None
collection = None

# Modo fallback: Si no hay URI de MongoDB, cargar los datos en memoria desde el JSON local para desarrollo/pruebas gratuitas instantáneas
local_data = []

def init_db():
    global client, db, collection, local_data
    if settings.mongodb_uri:
        try:
            client = AsyncIOMotorClient(settings.mongodb_uri)
            db = client[settings.database_name]
            collection = db[settings.collection_name]
            print("Conectado exitosamente a MongoDB Atlas (asíncrono).")
        except Exception as e:
            print(f"Error al conectar a MongoDB Atlas: {e}. Activando modo fallback local.")
            load_local_data()
    else:
        print("MONGODB_URI no configurada. Activando modo fallback (Carga local de centros_medicos.json).")
        load_local_data()

def load_local_data():
    global local_data
    # Intentar buscar el archivo json local subiendo directorios
    possible_paths = [
        "../public/data/centros_medicos.json",
        "public/data/centros_medicos.json",
        "../../public/data/centros_medicos.json"
    ]
    for path in possible_paths:
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                local_data = json.load(f)
                print(f"Modo Fallback: Cargados {len(local_data)} centros de salud desde {path}.")
                return
    print("[ERROR] No se pudo encontrar el archivo centros_medicos.json para el modo fallback local.")
