import os
import json
import urllib.request
import urllib.parse
from datetime import datetime

# Rutas de los archivos
DATA_PATH = "public/data/centros_medicos.json"
PREVIEW_PATH = "src/data/centros_medicos_preview.json"

def get_api_key():
    # Intentar obtener la API Key de las variables de entorno
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        # Intentar cargar desde un archivo .env si existe
        if os.path.exists(".env"):
            with open(".env", "r", encoding="utf-8") as f:
                for line in f:
                    if line.startswith("GOOGLE_PLACES_API_KEY="):
                        api_key = line.strip().split("=", 1)[1].replace('"', '').replace("'", "")
                        break
    return api_key

def verify_google_places(query, api_key):
    # Reemplazar espacios y caracteres especiales para la URL
    encoded_query = urllib.parse.quote(query)
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={encoded_query}&key={api_key}"
    
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            
            if res_data.get("status") == "OK" and res_data.get("results"):
                # Tomamos la primera coincidencia
                best_match = res_data["results"][0]
                business_status = best_match.get("business_status", "OPERATIONAL")
                place_id = best_match.get("place_id")
                formatted_address = best_match.get("formatted_address")
                
                return {
                    "status": "success",
                    "business_status": business_status,
                    "place_id": place_id,
                    "formatted_address": formatted_address
                }
            elif res_data.get("status") == "ZERO_RESULTS":
                return {
                    "status": "zero_results",
                    "business_status": "UNKNOWN"
                }
            else:
                return {
                    "status": "error",
                    "message": res_data.get("status", "UNKNOWN_ERROR"),
                    "business_status": "UNKNOWN"
                }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "business_status": "UNKNOWN"
        }

def run(limit=10, simulate=False):
    print("=== Iniciando Verificación de Centros Médicos con Google Places ===")
    
    # Cargar datos
    if not os.path.exists(DATA_PATH):
        print(f"Error: No se encontró el archivo {DATA_PATH}")
        return
        
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        centros = json.load(f)
        
    api_key = get_api_key()
    
    if not api_key and not simulate:
        print("\n[ADVERTENCIA] No se detectó la variable GOOGLE_PLACES_API_KEY.")
        print("El script se ejecutará en MODO SIMULACIÓN de forma automática.")
        simulate = True
        
    print(f"Modo: {'SIMULACIÓN' if simulate else 'REAL (Google Places API)'}")
    print(f"Lote a procesar: Máximo {limit} centros no verificados.")
    
    count = 0
    updated_count = 0
    
    # Buscar centros que no hayan sido verificados o con verificación antigua
    for centro in centros:
        if count >= limit:
            break
            
        # Si ya tiene una verificación 'CLOSED_PERMANENTLY', podemos optar por saltarlo o re-verificarlo
        # Aquí solo procesaremos los que no tienen verificación o tienen estado 'UNKNOWN'
        verificado = centro.get("verificacion_google")
        
        if not verificado or verificado.get("estado_funcionamiento") == "UNKNOWN":
            count += 1
            nombre = centro["nombre"]
            comuna = centro["comuna"]
            query = f"{nombre}, {comuna}, Chile"
            
            print(f"\n[{count}/{limit}] Verificando: {nombre} ({comuna})")
            
            if simulate:
                # Simulación de respuesta para fines de desarrollo/pruebas
                import random
                # Hacemos que uno de cada 5 simule estar cerrado para ver el comportamiento
                status_sim = "CLOSED_PERMANENTLY" if random.random() < 0.2 else "OPERATIONAL"
                result = {
                    "status": "success",
                    "business_status": status_sim,
                    "place_id": f"mock_id_{centro['id']}",
                    "formatted_address": f"{centro['direccion']}, {comuna}, Chile"
                }
            else:
                result = verify_google_places(query, api_key)
                
            # Registrar resultado
            centro["verificacion_google"] = {
                "estado_funcionamiento": result["business_status"],
                "place_id": result.get("place_id"),
                "fecha_verificacion": datetime.now().isoformat(),
                "direccion_google": result.get("formatted_address")
            }
            
            # Si el negocio está cerrado permanentemente, agregamos un flag de inactivo
            if result["business_status"] == "CLOSED_PERMANENTLY":
                centro["activo"] = False
                print(f" -> [CERRADO PERMANENTEMENTE] Marcado como inactivo.")
            else:
                centro["activo"] = True
                print(f" -> Estado: {result['business_status']}")
                
            updated_count += 1

    # Guardar cambios si hubo actualizaciones
    if updated_count > 0:
        print(f"\nGuardando {updated_count} centros actualizados en {DATA_PATH}...")
        with open(DATA_PATH, "w", encoding="utf-8") as f:
            json.dump(centros, f, ensure_ascii=False, indent=2)
            
        # También actualizar el preview
        with open(PREVIEW_PATH, "w", encoding="utf-8") as f:
            json.dump(centros[:50], f, ensure_ascii=False, indent=2)
            
        print("¡Archivos actualizados correctamente!")
    else:
        print("\nNo se encontraron centros pendientes de verificación en este lote.")

if __name__ == "__main__":
    import sys
    # Se puede pasar un argumento numérico para el límite de registros a verificar
    limit_arg = 10
    simulate_arg = False
    
    for arg in sys.argv[1:]:
        if arg.startswith("--limit="):
            limit_arg = int(arg.split("=")[1])
        elif arg == "--simulate":
            simulate_arg = True
            
    run(limit=limit_arg, simulate=simulate_arg)
