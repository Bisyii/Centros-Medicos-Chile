from pydantic import BaseModel, Field
from typing import Optional

class GoogleVerificationSchema(BaseModel):
    estado_funcionamiento: str = Field(..., description="Estado del negocio en Google Maps (e.g. OPERATIONAL, CLOSED_PERMANENTLY)")
    place_id: Optional[str] = Field(None, description="Identificador único en Google Places")
    fecha_verificacion: str = Field(..., description="Timestamp ISO de verificación")
    direccion_google: Optional[str] = Field(None, description="Dirección formateada por Google")

class SISVerificationSchema(BaseModel):
    registrado: bool = Field(..., description="Si el centro está registrado en la SIS")
    acreditado: bool = Field(..., description="Si el centro está acreditado formalmente")
    codigo_registro: Optional[str] = Field(None, description="Código de registro/acreditación de la SIS")
    estado_sis: str = Field(..., description="Estado de acreditación")
    fecha_verificacion: str = Field(..., description="Timestamp ISO de verificación")

class CentroMedicoSchema(BaseModel):
    id: str = Field(..., description="ID único del centro de salud")
    nombre: str = Field(..., description="Nombre comercial u oficial del centro")
    tipo: str = Field(..., description="Tipo de establecimiento (e.g. CESFAM, Hospital, Clínica)")
    categoria: str = Field(..., description="Categoría administrativa (Público o Privado)")
    region: str = Field(..., description="Región de Chile")
    comuna: str = Field(..., description="Comuna de ubicación")
    direccion: str = Field(..., description="Dirección física del establecimiento")
    telefono: str = Field(..., description="Teléfono de contacto o indicación de OIRS")
    latitud: float = Field(..., description="Coordenada de latitud")
    longitud: float = Field(..., description="Coordenada de longitud")
    dependencia: str = Field(..., description="Entidad de la que depende la administración")
    activo: Optional[bool] = Field(True, description="Flag de disponibilidad operativa")
    verificacion_google: Optional[GoogleVerificationSchema] = None
    verificacion_sis: Optional[SISVerificationSchema] = None

    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "id": "200003",
                "nombre": "Clínica Alemana de Santiago (Vitacura)",
                "tipo": "Clínica",
                "categoria": "Privado",
                "region": "Región Metropolitana de Santiago",
                "comuna": "Vitacura",
                "direccion": "Av. Vitacura 5951",
                "telefono": "+56 2 2210 1111",
                "latitud": -33.3986,
                "longitud": -70.5739,
                "dependencia": "Administración Privada",
                "activo": True,
                "verificacion_google": {
                    "estado_funcionamiento": "OPERATIONAL",
                    "place_id": "ChIJ...",
                    "fecha_verificacion": "2026-08-21T15:00:00",
                    "direccion_google": "Av. Vitacura 5951, Vitacura, Chile"
                },
                "verificacion_sis": {
                    "registrado": True,
                    "acreditado": True,
                    "codigo_registro": "Reg-SIS-12345",
                    "estado_sis": "Acreditado Vigente",
                    "fecha_verificacion": "2026-08-21T15:00:00"
                }
            }
        }
