import urllib.request
import json
import os
import re
import csv
import unicodedata

GOV_DATASET_URL = "https://datos.gob.cl/dataset/3bf4cf7c-f638-4735-9a01-f65faae4beca/resource/2c44d782-3365-44e3-aefb-2c8b8363a1bc/download/establecimientos_20260811.csv"

def normalize_text(text):
    if not text:
        return ""
    text = text.strip().lower()
    text = ''.join(c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn')
    return text

def run():
    print("Cargando regiones_comunas_chile.json...")
    with open("regiones_comunas_chile.json", "r", encoding="utf-8") as f:
        config = json.load(f)
        
    regiones_list = config["regiones"]
    
    # Pre-calcular normalizaciones
    norm_regions = {normalize_text(r["region"]): r["region"] for r in regiones_list}
    
    def find_best_match(raw_region, raw_comuna):
        raw_r_norm = normalize_text(raw_region)
        raw_c_norm = normalize_text(raw_comuna)
        
        # Buscar región
        matched_region = None
        for r_norm, r_name in norm_regions.items():
            if r_norm in raw_r_norm or raw_r_norm in r_norm:
                matched_region = r_name
                break
        
        if not matched_region:
            matched_region = "Región Metropolitana de Santiago"
            
        # Buscar comuna en la región
        r_obj = next((r for r in regiones_list if r["region"] == matched_region), None)
        if r_obj:
            for c_name in r_obj["comunas"]:
                c_norm = normalize_text(c_name)
                if c_norm == raw_c_norm or c_norm in raw_c_norm or raw_c_norm in c_norm:
                    return matched_region, c_name
                    
        # Buscar comuna en cualquier región
        for r in regiones_list:
            for c_name in r["comunas"]:
                c_norm = normalize_text(c_name)
                if c_norm == raw_c_norm:
                    return r["region"], c_name
                    
        return matched_region, raw_comuna.title()

    print("Descargando base de datos oficial desde datos.gob.cl...")
    req = urllib.request.Request(
        GOV_DATASET_URL, 
        headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            csv_content = response.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f"Error al descargar los datos: {e}")
        return

    print("Descarga completada. Procesando datos oficiales de salud de Chile...")
    
    lines = csv_content.splitlines()
    if not lines:
        print("El archivo CSV está vacío.")
        return
        
    reader = csv.reader(lines, delimiter=';')
    headers = next(reader)
    
    try:
        name_idx = headers.index('EstablecimientoGlosa')
        region_idx = headers.index('RegionGlosa')
        comuna_idx = headers.index('ComunaGlosa')
        tipo_idx = headers.index('TipoEstablecimientoGlosa')
        via_idx = headers.index('TipoViaGlosa')
        via_nom_idx = headers.index('NombreVia')
        via_num_idx = headers.index('Numero')
        tel_idx = headers.index('TelefonoMovil_TelefonoFijo')
        lat_idx = headers.index('Latitud')
        lng_idx = headers.index('Longitud')
        dep_idx = headers.index('DependenciaAdministrativa')
        state_idx = headers.index('EstadoFuncionamiento')
    except ValueError as e:
        print(f"Error de columnas en el CSV: {e}")
        return

    output_centers = []
    id_counter = 300000

    # Agregar clínicas y centros manuales conocidos
    manual_real = [
        {
            "id": "200001",
            "nombre": "CESFAM Laurita Vicuña",
            "tipo": "CESFAM",
            "categoria": "Público",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Puente Alto",
            "direccion": "Av. Ejército Libertador 2433",
            "telefono": "+56 2 2485 4610",
            "latitud": -33.6268,
            "longitud: -70.5985",
            "dependencia": "Corporación Municipal de Puente Alto"
        },
        {
            "id": "200002",
            "nombre": "Hospital Dr. Sótero del Río",
            "tipo": "Hospital",
            "categoria": "Público",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Puente Alto",
            "direccion": "Av. Concha y Toro 3459",
            "telefono": "+56 2 2576 0000",
            "latitud": -33.5794,
            "longitud": -70.5795,
            "dependencia": "Servicio de Salud Metropolitano Sur Oriente"
        },
        {
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
            "dependencia": "Administración Privada"
        },
        {
            "id": "200004",
            "nombre": "Hospital Clínico de la Pontificia Universidad Católica",
            "tipo": "Hospital",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Santiago",
            "direccion": "Av. Marcoleta 367",
            "telefono": "+56 2 2354 3000",
            "latitud": -33.4415,
            "longitud": -70.6409,
            "dependencia": "Red de Salud UC CHRISTUS"
        },
        {
            "id": "200005",
            "nombre": "CESFAM Dr. Alejandro del Río",
            "tipo": "CESFAM",
            "categoria": "Público",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Puente Alto",
            "direccion": "Calle Gandarillas 111",
            "telefono": "+56 2 2485 4100",
            "latitud": -33.6167,
            "longitud": -70.5798,
            "dependencia": "Corporación Municipal de Puente Alto"
        },
        {
            "id": "200006",
            "nombre": "Clínica RedSalud Vitacura",
            "tipo": "Clínica",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Vitacura",
            "direccion": "Tabancura 1185",
            "telefono": "+56 2 2240 3000",
            "latitud": -33.3768,
            "longitud": -70.5367,
            "dependencia": "Administración Privada"
        },
        {
            "id": "200007",
            "nombre": "CESFAM Karol Wojtyla",
            "tipo": "CESFAM",
            "categoria": "Público",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Puente Alto",
            "direccion": "Av. Curaco de Vélez 4110",
            "telefono": "+56 2 2485 4800",
            "latitud": -33.5855,
            "longitud": -70.5482,
            "dependencia": "Corporación Municipal de Puente Alto"
        },
        {
            "id": "200008",
            "nombre": "IntegraMédica Huérfanos",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Santiago",
            "direccion": "Huérfanos 1147",
            "telefono": "+56 2 2631 3000",
            "latitud": -33.4395,
            "longitud": -70.6542,
            "dependencia": "IntegraMédica Bupa"
        },
        {
            "id": "200009",
            "nombre": "IntegraMédica Alameda",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Santiago",
            "direccion": "Av. Libertador Bernardo O'Higgins 654",
            "telefono": "+56 2 2631 3000",
            "latitud": -33.4442,
            "longitud": -70.6457,
            "dependencia": "IntegraMédica Bupa"
        },
        {
            "id": "200010",
            "nombre": "IntegraMédica Bandera",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Santiago",
            "direccion": "Bandera 168",
            "telefono": "+56 2 2631 3000",
            "latitud": -33.4429,
            "longitud": -70.6515,
            "dependencia": "IntegraMédica Bupa"
        },
        {
            "id": "200011",
            "nombre": "IntegraMédica La Concepción",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Providencia",
            "direccion": "La Concepción 206, Piso 1",
            "telefono": "+56 2 2631 3000",
            "latitud": -33.4243,
            "longitud": -70.6152,
            "dependencia": "IntegraMédica Bupa"
        },
        {
            "id": "200012",
            "nombre": "IntegraMédica Mall Plaza Vespucio",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "La Florida",
            "direccion": "Av. Vicuña Mackenna Oriente 7110, Local E-976",
            "telefono": "+56 2 2631 3000",
            "latitud": -33.5218,
            "longitud": -70.5982,
            "dependencia": "IntegraMédica Bupa"
        },
        {
            "id": "200013",
            "nombre": "Centro de Innovación en Salud Áncora San Francisco",
            "tipo": "Centro Médico",
            "categoria": "Público",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Puente Alto",
            "direccion": "Av. Concha y Toro 3720",
            "telefono": "+56 2 2354 8000",
            "latitud": -33.5684,
            "longitud": -70.5752,
            "dependencia": "Red de Salud UC CHRISTUS"
        },
        {
            "id": "200014",
            "nombre": "Laboratorio CLINI - Tobalaba",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Providencia",
            "direccion": "Luis Thayer Ojeda 085",
            "telefono": "+56 2 2783 7200",
            "latitud": -33.4184,
            "longitud": -70.6062,
            "dependencia": "Red CLINI"
        },
        {
            "id": "200015",
            "nombre": "Laboratorio CLINI - Moneda",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Santiago",
            "direccion": "Av. Libertador Bernardo O'Higgins 1529",
            "telefono": "+56 2 2783 7200",
            "latitud": -33.4451,
            "longitud": -70.6575,
            "dependencia": "Red CLINI"
        },
        {
            "id": "200016",
            "nombre": "Laboratorio CLINI - Maipú",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "Maipú",
            "direccion": "Av. Pajaritos 2624, Local 32",
            "telefono": "+56 2 2783 7200",
            "latitud": -33.5097,
            "longitud": -70.7571,
            "dependencia": "Red CLINI"
        },
        {
            "id": "200017",
            "nombre": "Laboratorio CLINI - San Bernardo",
            "tipo": "Centro Médico",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "San Bernardo",
            "direccion": "Av. Libertador Bernardo O'Higgins 337",
            "telefono": "+56 2 2783 7200",
            "latitud": -33.5901,
            "longitud": -70.7052,
            "dependencia": "Red CLINI"
        },
        {
            "id": "200018",
            "nombre": "Clínica Bupa Santiago",
            "tipo": "Clínica",
            "categoria": "Privado",
            "region": "Región Metropolitana de Santiago",
            "comuna": "La Florida",
            "direccion": "Av. Departamental 1455",
            "telefono": "+56 2 2307 0000",
            "latitud": -33.5049,
            "longitud": -70.5791,
            "dependencia": "Bupa Chile"
        },
        {
            "id": "200019",
            "nombre": "Clínica Bupa Reñaca",
            "tipo": "Clínica",
            "categoria": "Privado",
            "region": "Región de Valparaíso",
            "comuna": "Viña Del Mar",
            "direccion": "Calle Anabaena 336, Reñaca",
            "telefono": "+56 32 265 8000",
            "latitud": -32.9774,
            "longitud": -71.5362,
            "dependencia": "Bupa Chile"
        },
        {
            "id": "200020",
            "nombre": "Clínica Bupa Antofagasta",
            "tipo": "Clínica",
            "categoria": "Privado",
            "region": "Región de Antofagasta",
            "comuna": "Antofagasta",
            "direccion": "Av. Manuel Antonio Matta 1945",
            "telefono": "+56 55 246 8000",
            "latitud": -23.6491,
            "longitud": -70.3984,
            "dependencia": "Bupa Chile"
        }
    ]

    output_centers.extend(manual_real)
    
    for row in reader:
        if len(row) <= max(name_idx, region_idx, comuna_idx):
            continue
            
        raw_name = row[name_idx]
        raw_comuna = row[comuna_idx]
        raw_region = row[region_idx]
        raw_tipo = row[tipo_idx] if row[tipo_idx] else 'Otro'
        raw_dep = row[dep_idx] if row[dep_idx] else 'Servicio de Salud Local'
        raw_state = row[state_idx] if row[state_idx] else ''
        
        # Ignorar inactivos
        if "cierre" in raw_state.lower() or "inactivo" in raw_state.lower():
            continue
            
        if not raw_name or not raw_comuna:
            continue
            
        name_lower = raw_name.lower()
        # Evitar duplicar los manuales
        if any(keyword in name_lower for keyword in ["laurita", "clini", "bupa", "ancora", "áncora", "alejandro del rio", "alejandro del río", "karol wojtyla", "sotero del rio", "sótero del río", "alemana de santiago", "clinica redsalud vitacura", "redsalud vitacura"]):
            continue
            
        # Homologar Tipo
        tipo = "Otro"
        if "cesfam" in raw_tipo.lower() or "cesfam" in name_lower:
            tipo = "CESFAM"
        elif "hospital" in raw_tipo.lower() or "hospital" in name_lower:
            tipo = "Hospital"
        elif "sapu" in raw_tipo.lower() or "sar" in raw_tipo.lower() or "sapu" in name_lower or "sar" in name_lower:
            tipo = "SAPU / SAR"
        elif "clínica" in raw_tipo.lower() or "clinica" in name_lower:
            tipo = "Clínica"
        elif "centro médico" in raw_tipo.lower() or "consultorio" in raw_tipo.lower() or "centro medico" in name_lower or "consultorio" in name_lower:
            tipo = "Centro Médico"
            
        # Determinar Categoría
        categoria = "Público"
        if tipo == "Clínica" or "privado" in raw_dep.lower() or any(k in name_lower for k in ["alemana", "redsalud", "bupa", "integramedica"]):
            categoria = "Privado"
            
        # Mapear región y comuna con regiones_comunas_chile.json
        region, comuna = find_best_match(raw_region, raw_comuna)
        
        # Armar dirección
        via_glosa = row[via_idx] if row[via_idx] else ''
        via_nom = row[via_nom_idx] if row[via_nom_idx] else ''
        via_num = row[via_num_idx] if row[via_num_idx] else ''
        
        direccion = "Calle Principal S/N"
        if via_nom:
            direccion = f"{via_glosa} {via_nom} {via_num}".strip()
            direccion = re.sub(r'\s+', ' ', direccion)
            
        # Limpiar coordenadas
        try:
            lat = float(row[lat_idx]) if row[lat_idx] else 0.0
            lng = float(row[lng_idx]) if row[lng_idx] else 0.0
        except ValueError:
            lat, lng = 0.0, 0.0
            
        if lat > 0:
            lat = -lat
        if lng > 0:
            lng = -lng
            
        id_counter += 1
        output_centers.append({
            "id": str(id_counter),
            "nombre": raw_name,
            "tipo": tipo,
            "categoria": categoria,
            "region": region,
            "comuna": comuna,
            "direccion": direccion,
            "telefono": row[tel_idx] if row[tel_idx] else "Llamar al Centro / Consultar OIRS",
            "latitud": round(lat, 5),
            "longitud": round(lng, 5),
            "dependencia": raw_dep
        })
        
    print(f"Procesados {len(output_centers)} centros de salud oficiales de Chile mapeados con regiones_comunas_chile.json.")
    
    os.makedirs("public/data", exist_ok=True)
    os.makedirs("src/data", exist_ok=True)
    
    with open("public/data/centros_medicos.json", "w", encoding="utf-8") as f:
        json.dump(output_centers, f, ensure_ascii=False, indent=2)
        
    with open("src/data/centros_medicos_preview.json", "w", encoding="utf-8") as f:
        json.dump(output_centers[:50], f, ensure_ascii=False, indent=2)
        
    print("¡Proceso completado de forma exitosa!")

if __name__ == "__main__":
    run()
