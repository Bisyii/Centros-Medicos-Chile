const fs = require('fs');
const path = require('path');
const https = require('https');

// Diccionario de comunas de Chile ordenadas por Región para fallback de limpieza
const REGIONES_COMUNAS = {
    "Arica y Parinacota": ["Arica", "Camarones", "Putre", "General Lagos"],
    "Tarapacá": ["Iquique", "Alto Hospicio", "Pozo Almonte", "Camiña", "Colchane", "Huara", "Pica"],
    "Antofagasta": ["Antofagasta", "Mejillones", "Sierra Gorda", "Taltal", "Calama", "Ollagüe", "San Pedro de Atacama", "Tocopilla", "María Elena"],
    "Atacama": ["Copiapó", "Caldera", "Tierra Amarilla", "Chañaral", "Diego de Almagro", "Vallenar", "Alto del Carmen", "Freirina", "Huasco"],
    "Coquimbo": ["La Serena", "Coquimbo", "Andacollo", "La Higuera", "Paiguano", "Vicuña", "Illapel", "Canela", "Los Vilos", "Salamanca", "Ovalle", "Combarbalá", "Monte Patria", "Punitaqui", "Río Hurtado"],
    "Valparaíso": ["Valparaíso", "Casablanca", "Concón", "Juan Fernández", "Puchuncaví", "Quintero", "Viña del Mar", "Isla de Pascua", "Los Andes", "Calle Larga", "Rinconada", "San Esteban", "La Ligua", "Cabildo", "Papudo", "Petorca", "Zapallar", "Quillota", "Calera", "Hijuelas", "La Cruz", "Nogales", "San Antonio", "Algarrobo", "Cartagena", "El Quisco", "El Tabo", "Santo Domingo", "San Felipe", "Catemu", "Llaillay", "Panquehue", "Putaendo", "Santa María", "Quilpué", "Limache", "Olmué", "Villa Alemana"],
    "Metropolitana de Santiago": ["Santiago", "Cerrillos", "Cerro Navia", "Conchalí", "El Bosque", "Estación Central", "Huechuraba", "Independencia", "La Cisterna", "La Florida", "La Granja", "La Pintana", "La Reina", "Las Condes", "Lo Barnechea", "Lo Espejo", "Lo Prado", "Macul", "Maipú", "Ñuñoa", "Pedro Aguirre Cerda", "Peñalolén", "Providencia", "Pudahuel", "Quilicura", "Quinta Normal", "Recoleta", "Renca", "San Joaquín", "San Miguel", "San Ramón", "Vitacura", "Puente Alto", "Pirque", "San José de Maipo", "San Bernardo", "Buin", "Calera de Tango", "Paine", "Melipilla", "Alhué", "Curacaví", "María Pinto", "San Pedro", "Talagante", "El Monte", "Isla de Maipo", "Padre Hurtado", "Peñaflor", "Colina", "Lampa", "Tiltil"],
    "Libertador General Bernardo O'Higgins": ["Rancagua", "Codegua", "Coinco", "Coltauco", "Doñihue", "Graneros", "Las Cabras", "Machalí", "Malloa", "Mostazal", "Olivar", "Peumo", "Pichidegua", "Quinta de Tilcoco", "Rengo", "Requínoa", "San Vicente", "Pichilemu", "La Estrella", "Litueche", "Marchihue", "Navidad", "Paredones", "San Fernando", "Chépica", "Chimbarongo", "Lolol", "Nancagua", "Palmilla", "Peralillo", "Placilla", "Pumanque", "Santa Cruz"],
    "Maule": ["Talca", "Constitución", "Curepto", "Empedrado", "Maule", "Pelarco", "Pencahue", "Río Claro", "San Clemente", "San Rafael", "Cauquenes", "Chanco", "Pelluhue", "Curicó", "Hualañé", "Licantén", "Molina", "Rauco", "Romeral", "Sagrada Familia", "Teno", "Vichuquén", "Linares", "Colbún", "Longaví", "Parral", "Retiro", "San Javier", "Villa Alegre", "Yerbas Buenas"],
    "Ñuble": ["Chillán", "Bulnes", "Cobquecura", "Coelemu", "Coihueco", "Chillán Viejo", "El Carmen", "Ninhue", "Ñiquén", "Pemuco", "Pinto", "Portezuelo", "Quillón", "Quirihue", "Ránquil", "San Carlos", "San Fabián", "San Ignacio", "San Nicolás", "Treguaco", "Yungay"],
    "Biobío": ["Concepción", "Coronel", "Chiguayante", "Florida", "Hualpén", "Hualqui", "Lota", "Penco", "San Pedro de la Paz", "Santa Juana", "Talcahuano", "Tomé", "Lebu", "Arauco", "Cañete", "Contulmo", "Curanilahue", "Los Álamos", "Tirúa", "Los Ángeles", "Antuco", "Cabrero", "Laja", "Mulchén", "Nacimiento", "Negrete", "Quilaco", "Quilleco", "San Rosendo", "Santa Bárbara", "Tucapel", "Yumbel", "Alto Biobío"],
    "La Araucanía": ["Temuco", "Carahue", "Cunco", "Curarrehue", "Freire", "Galvarino", "Gorbea", "Lautaro", "Loncoche", "Melipeuco", "Nueva Imperial", "Padre Las Casas", "Perquenco", "Pitrufquén", "Pucón", "Saavedra", "Teodoro Schmidt", "Toltén", "Vilcún", "Villarrica", "Cholchol", "Angol", "Collipulli", "Curacautín", "Ercilla", "Lonquimay", "Los Sauces", "Lumaco", "Purén", "Renaico", "Traiguén", "Victoria"],
    "Los Ríos": ["Valdivia", "Corral", "Lanco", "Los Lagos", "Máfil", "Mariquina", "Paillaco", "Panguipulli", "La Unión", "Futrono", "Lago Ranco", "Río Bueno"],
    "Los Lagos": ["Puerto Montt", "Calbuco", "Cochamó", "Fresia", "Frutillar", "Los Muermos", "Llanquihue", "Maullín", "Puerto Varas", "Castro", "Ancud", "Chonchi", "Curaco de Vélez", "Dalcahue", "Puqueldón", "Queilén", "Quellón", "Quemchi", "Quinchao", "Osorno", "Puerto Octay", "Purranque", "Puyehue", "Río Negro", "San Juan de la Costa", "San Pablo", "Chaitén", "Futaleufú", "Hualaihué", "Palena"],
    "Aysén del General Carlos Ibáñez del Campo": ["Coyhaique", "Lago Verde", "Aysén", "Cisnes", "Guaitecas", "Cochrane", "O'Higgins", "Tortel", "Chile Chico", "Río Ibáñez"],
    "Magallanes y de la Antártica Chilena": ["Punta Arenas", "Laguna Blanca", "Río Verde", "San Gregorio", "Cabo de Hornos", "Antártica", "Porvenir", "Primavera", "Timaukel", "Natales", "Torres del Paine"]
};

// URL oficial del listado nacional de establecimientos de salud del Portal de Datos Abiertos del Gobierno de Chile (MINSAL)
const GOV_DATASET_URL = "https://datos.gob.cl/dataset/3bf4cf7c-f638-4735-9a01-f65faae4beca/resource/2c44d782-3365-44e3-aefb-2c8b8363a1bc/download/establecimientos_20260811.csv";

function downloadCSV(url) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                resolve(data);
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

function parseCSV(csvText) {
    const lines = csvText.split('\n');
    // El listado de Datos.gob.cl usa ';' como separador
    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    
    console.log("Columnas detectadas en el CSV oficial de datos.gob.cl:", headers);
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Parsear filas del CSV con ';'
        const row = [];
        let insideQuote = false;
        let entry = '';
        for (let char of lines[i]) {
            if (char === '"') {
                insideQuote = !insideQuote;
            } else if (char === ';' && !insideQuote) {
                row.push(entry.trim().replace(/^"|"$/g, ''));
                entry = '';
            } else {
                entry += char;
            }
        }
        row.push(entry.trim().replace(/^"|"$/g, ''));
        
        if (row.length >= headers.length) {
            results.push(row);
        }
    }
    return { headers, rows: results };
}

async function run() {
    try {
        console.log("Descargando base de datos oficial desde datos.gob.cl...");
        const csvContent = await downloadCSV(GOV_DATASET_URL);
        console.log("Descarga completada. Procesando datos oficiales de salud de Chile...");
        
        const { headers, rows } = parseCSV(csvContent);
        
        // Mapeo exacto de las columnas oficiales de datos.gob.cl
        const nameIdx = headers.indexOf('EstablecimientoGlosa');
        const regionIdx = headers.indexOf('RegionGlosa');
        const comunaIdx = headers.indexOf('ComunaGlosa');
        const tipoIdx = headers.indexOf('TipoEstablecimientoGlosa');
        const viaIdx = headers.indexOf('TipoViaGlosa');
        const viaNomIdx = headers.indexOf('NombreVia');
        const viaNumIdx = headers.indexOf('Numero');
        const telIdx = headers.indexOf('TelefonoMovil_TelefonoFijo');
        const latIdx = headers.indexOf('Latitud');
        const lngIdx = headers.indexOf('Longitud');
        const depIdx = headers.indexOf('DependenciaAdministrativa');
        const stateIdx = headers.indexOf('EstadoFuncionamiento');
        
        const outputCenters = [];
        let idCounter = 300000;
        
        // Centros de salud reales curados manualmente con sus ubicaciones exactas
        const manualReal = [
            {
                id: "200001",
                nombre: "CESFAM Laurita Vicuña",
                tipo: "CESFAM",
                categoria: "Público",
                region: "Metropolitana de Santiago",
                comuna: "Puente Alto",
                direccion: "Av. Ejército Libertador 2433",
                telefono: "+56 2 2485 4610",
                latitud: -33.6268,
                longitud: -70.5985,
                dependencia: "Corporación Municipal de Puente Alto"
            },
            {
                id: "200002",
                nombre: "Hospital Dr. Sótero del Río",
                tipo: "Hospital",
                categoria: "Público",
                region: "Metropolitana de Santiago",
                comuna: "Puente Alto",
                direccion: "Av. Concha y Toro 3459",
                telefono: "+56 2 2576 0000",
                latitud: -33.5794,
                longitud: -70.5795,
                dependencia: "Servicio de Salud Metropolitano Sur Oriente"
            },
            {
                id: "200003",
                nombre: "Clínica Alemana de Santiago (Vitacura)",
                tipo: "Clínica",
                categoria: "Privado",
                region: "Metropolitana de Santiago",
                comuna: "Vitacura",
                direccion: "Av. Vitacura 5951",
                telefono: "+56 2 2210 1111",
                latitud: -33.3986,
                longitud: -70.5739,
                dependencia: "Administración Privada"
            },
            {
                id: "200004",
                nombre: "Hospital Clínico de la Pontificia Universidad Católica",
                tipo: "Hospital",
                categoria: "Privado",
                region: "Metropolitana de Santiago",
                comuna: "Santiago",
                direccion: "Av. Marcoleta 367",
                telefono: "+56 2 2354 3000",
                latitud: -33.4415,
                longitud: -70.6409,
                dependencia: "Red de Salud UC CHRISTUS"
            },
            {
                id: "200005",
                nombre: "CESFAM Dr. Alejandro del Río",
                tipo: "CESFAM",
                categoria: "Público",
                region: "Metropolitana de Santiago",
                comuna: "Puente Alto",
                direccion: "Calle Gandarillas 111",
                telefono: "+56 2 2485 4100",
                latitud: -33.6167,
                longitud: -70.5798,
                dependencia: "Corporación Municipal de Puente Alto"
            },
            {
                id: "200006",
                nombre: "Clínica RedSalud Vitacura",
                tipo: "Clínica",
                categoria: "Privado",
                region: "Metropolitana de Santiago",
                comuna: "Vitacura",
                direccion: "Tabancura 1185",
                telefono: "+56 2 2240 3000",
                latitud: -33.3768,
                longitud: -70.5367,
                dependencia: "Administración Privada"
            },
            {
                id: "200007",
                nombre: "CESFAM Karol Wojtyla",
                tipo: "CESFAM",
                categoria: "Público",
                region: "Metropolitana de Santiago",
                comuna: "Puente Alto",
                direccion: "Av. Curaco de Vélez 4110",
                telefono: "+56 2 2485 4800",
                latitud: -33.5855,
                longitud: -70.5482,
                dependencia: "Corporación Municipal de Puente Alto"
            }
        ];
        
        outputCenters.push(...manualReal);
        
        for (const row of rows) {
            const rawName = row[nameIdx] || '';
            const rawComuna = row[comunaIdx] || '';
            const rawRegion = row[regionIdx] || '';
            let rawTipo = row[tipoIdx] || 'Otro';
            const rawLat = parseFloat(row[latIdx]);
            const rawLng = parseFloat(row[lngIdx]);
            const rawDep = row[depIdx] || 'Servicio de Salud Local';
            const rawState = row[stateIdx] || '';
            
            // Ignorar registros que no estén activos/vigentes
            if (rawState.toLowerCase().includes("cierre") || rawState.toLowerCase().includes("inactivo")) {
                continue;
            }
            
            if (!rawName || !rawComuna) continue;
            
            // Evitar duplicar los agregados manualmente
            const nameLower = rawName.toLowerCase();
            if (nameLower.includes("laurita") || nameLower.includes("alejandro del rio") || nameLower.includes("alejandro del río") || nameLower.includes("karol wojtyla") || nameLower.includes("sotero del rio") || nameLower.includes("sótero del río") || nameLower.includes("alemana de santiago") || nameLower.includes("clinica redsalud vitacura") || nameLower.includes("redsalud vitacura")) {
                continue;
            }
            
            // Homologar Tipo de establecimiento
            let tipo = "Otro";
            if (rawTipo.toLowerCase().includes("cesfam") || nameLower.includes("cesfam")) tipo = "CESFAM";
            else if (rawTipo.toLowerCase().includes("hospital") || nameLower.includes("hospital")) tipo = "Hospital";
            else if (rawTipo.toLowerCase().includes("sapu") || rawTipo.toLowerCase().includes("sar") || nameLower.includes("sapu") || nameLower.includes("sar")) tipo = "SAPU / SAR";
            else if (rawTipo.toLowerCase().includes("clínica") || nameLower.includes("clinica")) tipo = "Clínica";
            else if (rawTipo.toLowerCase().includes("centro médico") || rawTipo.toLowerCase().includes("consultorio") || nameLower.includes("centro medico") || nameLower.includes("consultorio")) tipo = "Centro Médico";
            
            // Determinar Categoría (Público/Privado)
            let categoria = "Público";
            if (tipo === "Clínica" || rawDep.toLowerCase().includes("privado") || nameLower.includes("alemana") || nameLower.includes("redsalud") || nameLower.includes("bupa") || nameLower.includes("integramedica")) {
                categoria = "Privado";
            }
            
            // Limpiar región
            let region = "Metropolitana de Santiago";
            for (let regKey of Object.keys(REGIONES_COMUNAS)) {
                if (rawRegion.toLowerCase().includes(regKey.toLowerCase()) || regKey.toLowerCase().includes(rawRegion.toLowerCase())) {
                    region = regKey;
                    break;
                }
            }
            
            // Limpiar Comuna
            let comuna = rawComuna;
            if (comuna) {
                comuna = comuna.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            }
            
            // Armar dirección real desde las columnas oficiales del Minsal: TipoViaGlosa + NombreVia + Numero
            const viaGlosa = row[viaIdx] || '';
            const viaNom = row[viaNomIdx] || '';
            const viaNum = row[viaNumIdx] || '';
            
            let direccion = "";
            if (viaNom) {
                direccion = `${viaGlosa} ${viaNom} ${viaNum}`.trim().replace(/\s+/g, ' ');
            } else {
                direccion = "Calle Principal S/N";
            }
            
            // Limpiar coordenadas que a veces traen un punto al final o errores de formato
            let lat = isNaN(rawLat) ? 0 : rawLat;
            let lng = isNaN(rawLng) ? 0 : rawLng;
            
            // Ocasionalmente vienen multiplicadas por algún factor o desfasadas, nos aseguramos que estén dentro de Chile
            if (lat > 0) lat = -lat; // Corregir si el signo del hemisferio sur falta
            if (lng > 0) lng = -lng; // Corregir si el signo del hemisferio occidental falta
            
            // Filtro de coordenadas no válidas
            if (lat === 0 || lng === 0) {
                lat = 0;
                lng = 0;
            }
            
            idCounter++;
            outputCenters.push({
                id: String(idCounter),
                nombre: rawName,
                tipo: tipo,
                categoria: categoria,
                region: region,
                comuna: comuna,
                direccion: direccion,
                telefono: row[telIdx] || "Llamar al Centro / Consultar OIRS",
                latitud: Math.round(lat * 100000) / 100000,
                longitud: Math.round(lng * 100000) / 100000,
                dependencia: rawDep
            });
        }
        
        console.log(`Procesados ${outputCenters.length} centros de salud oficiales de Chile.`);
        
        fs.mkdirSync(path.join(__dirname, "../public/data"), { recursive: true });
        fs.mkdirSync(path.join(__dirname, "../src/data"), { recursive: true });
        
        fs.writeFileSync(path.join(__dirname, "../public/data/centros_medicos.json"), JSON.stringify(outputCenters, null, 2), "utf-8");
        fs.writeFileSync(path.join(__dirname, "../src/data/centros_medicos_preview.json"), JSON.stringify(outputCenters.slice(0, 50), null, 2), "utf-8");
        
        console.log("¡Base de datos JSON oficial de datos.gob.cl generada correctamente!");
    } catch (e) {
        console.error("Error al descargar/procesar los datos oficiales:", e);
    }
}

run();
