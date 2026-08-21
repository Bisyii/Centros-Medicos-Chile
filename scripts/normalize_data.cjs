const fs = require('fs');
const path = require('path');
const https = require('https');

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
    const headers = lines[0].split(';').map(h => h.trim().replace(/^"|"$/g, ''));
    
    console.log("Columnas detectadas en el CSV oficial de datos.gob.cl:", headers);
    
    const results = [];
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
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

function normalizeText(text) {
    if (!text) return "";
    return text.trim().toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

async function run() {
    try {
        console.log("Cargando regiones_comunas_chile.json...");
        const configPath = path.join(__dirname, "../regiones_comunas_chile.json");
        if (!fs.existsSync(configPath)) {
            throw new Error(`No se encontró el archivo regiones_comunas_chile.json en ${configPath}`);
        }
        const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const regionesList = config.regiones;
        
        const normRegions = {};
        for (const r of regionesList) {
            normRegions[normalizeText(r.region)] = r.region;
        }
        
        function findBestMatch(rawRegion, rawComuna) {
            const rawRNorm = normalizeText(rawRegion);
            const rawCNorm = normalizeText(rawComuna);
            
            let matchedRegion = null;
            for (const rNorm of Object.keys(normRegions)) {
                if (rNorm.includes(rawRNorm) || rawRNorm.includes(rNorm)) {
                    matchedRegion = normRegions[rNorm];
                    break;
                }
            }
            
            if (!matchedRegion) {
                matchedRegion = "Región Metropolitana de Santiago";
            }
            
            const rObj = regionesList.find(r => r.region === matchedRegion);
            if (rObj) {
                for (const cName of rObj.comunas) {
                    const cNorm = normalizeText(cName);
                    if (cNorm === rawCNorm || cNorm.includes(rawCNorm) || rawCNorm.includes(cNorm)) {
                        return { region: matchedRegion, comuna: cName };
                    }
                }
            }
            
            for (const r of regionesList) {
                for (const cName of r.comunas) {
                    const cNorm = normalizeText(cName);
                    if (cNorm === rawCNorm) {
                        return { region: r.region, comuna: cName };
                    }
                }
            }
            
            const capitalizedComuna = rawComuna.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
            return { region: matchedRegion, comuna: capitalizedComuna };
        }

        console.log("Descargando base de datos oficial desde datos.gob.cl...");
        const csvContent = await downloadCSV(GOV_DATASET_URL);
        console.log("Descarga completada. Procesando datos oficiales de salud de Chile...");
        
        const { headers, rows } = parseCSV(csvContent);
        
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
        
        const manualReal = [
            {
                id: "200001",
                nombre: "CESFAM Laurita Vicuña",
                tipo: "CESFAM",
                categoria: "Público",
                region: "Región Metropolitana de Santiago",
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
                region: "Región Metropolitana de Santiago",
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
                region: "Región Metropolitana de Santiago",
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
                region: "Región Metropolitana de Santiago",
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
                region: "Región Metropolitana de Santiago",
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
                region: "Región Metropolitana de Santiago",
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
                region: "Región Metropolitana de Santiago",
                comuna: "Puente Alto",
                direccion: "Av. Curaco de Vélez 4110",
                telefono: "+56 2 2485 4800",
                latitud: -33.5855,
                longitud: -70.5482,
                dependencia: "Corporación Municipal de Puente Alto"
            },
            {
                id: "200008",
                nombre: "IntegraMédica Huérfanos",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Santiago",
                direccion: "Huérfanos 1147",
                telefono: "+56 2 2631 3000",
                latitud: -33.4395,
                longitud: -70.6542,
                dependencia: "IntegraMédica Bupa"
            },
            {
                id: "200009",
                nombre: "IntegraMédica Alameda",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Santiago",
                direccion: "Av. Libertador Bernardo O'Higgins 654",
                telefono: "+56 2 2631 3000",
                latitud: -33.4442,
                longitud: -70.6457,
                dependencia: "IntegraMédica Bupa"
            },
            {
                id: "200010",
                nombre: "IntegraMédica Bandera",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Santiago",
                direccion: "Bandera 168",
                telefono: "+56 2 2631 3000",
                latitud: -33.4429,
                longitud: -70.6515,
                dependencia: "IntegraMédica Bupa"
            },
            {
                id: "200011",
                nombre: "IntegraMédica La Concepción",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Providencia",
                direccion: "La Concepción 206, Piso 1",
                telefono: "+56 2 2631 3000",
                latitud: -33.4243,
                longitud: -70.6152,
                dependencia: "IntegraMédica Bupa"
            },
            {
                id: "200012",
                nombre: "IntegraMédica Mall Plaza Vespucio",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "La Florida",
                direccion: "Av. Vicuña Mackenna Oriente 7110, Local E-976",
                telefono: "+56 2 2631 3000",
                latitud: -33.5218,
                longitud: -70.5982,
                dependencia: "IntegraMédica Bupa"
            },
            {
                id: "200013",
                nombre: "Centro de Innovación en Salud Áncora San Francisco",
                tipo: "Centro Médico",
                categoria: "Público",
                region: "Región Metropolitana de Santiago",
                comuna: "Puente Alto",
                direccion: "Av. Concha y Toro 3720",
                telefono: "+56 2 2354 8000",
                latitud: -33.5684,
                longitud: -70.5752,
                dependencia: "Red de Salud UC CHRISTUS"
            },
            {
                id: "200014",
                nombre: "Laboratorio CLINI - Tobalaba",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Providencia",
                direccion: "Luis Thayer Ojeda 085",
                telefono: "+56 2 2783 7200",
                latitud: -33.4184,
                longitud: -70.6062,
                dependencia: "Red CLINI"
            },
            {
                id: "200015",
                nombre: "Laboratorio CLINI - Moneda",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Santiago",
                direccion: "Av. Libertador Bernardo O'Higgins 1529",
                telefono: "+56 2 2783 7200",
                latitud: -33.4451,
                longitud: -70.6575,
                dependencia: "Red CLINI"
            },
            {
                id: "200016",
                nombre: "Laboratorio CLINI - Maipú",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "Maipú",
                direccion: "Av. Pajaritos 2624, Local 32",
                telefono: "+56 2 2783 7200",
                latitud: -33.5097,
                longitud: -70.7571,
                dependencia: "Red CLINI"
            },
            {
                id: "200017",
                nombre: "Laboratorio CLINI - San Bernardo",
                tipo: "Centro Médico",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "San Bernardo",
                direccion: "Av. Libertador Bernardo O'Higgins 337",
                telefono: "+56 2 2783 7200",
                latitud: -33.5901,
                longitud: -70.7052,
                dependencia: "Red CLINI"
            },
            {
                id: "200018",
                nombre: "Clínica Bupa Santiago",
                tipo: "Clínica",
                categoria: "Privado",
                region: "Región Metropolitana de Santiago",
                comuna: "La Florida",
                direccion: "Av. Departamental 1455",
                telefono: "+56 2 2307 0000",
                latitud: -33.5049,
                longitud: -70.5791,
                dependencia: "Bupa Chile"
            },
            {
                id: "200019",
                nombre: "Clínica Bupa Reñaca",
                tipo: "Clínica",
                categoria: "Privado",
                region: "Región de Valparaíso",
                comuna: "Viña Del Mar",
                direccion: "Calle Anabaena 336, Reñaca",
                telefono: "+56 32 265 8000",
                latitud: -32.9774,
                longitud: -71.5362,
                dependencia: "Bupa Chile"
            },
            {
                id: "200020",
                nombre: "Clínica Bupa Antofagasta",
                tipo: "Clínica",
                categoria: "Privado",
                region: "Región de Antofagasta",
                comuna: "Antofagasta",
                direccion: "Av. Manuel Antonio Matta 1945",
                telefono: "+56 55 246 8000",
                latitud: -23.6491,
                longitud: -70.3984,
                dependencia: "Bupa Chile"
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
            
            if (rawState.toLowerCase().includes("cierre") || rawState.toLowerCase().includes("inactivo")) {
                continue;
            }
            
            if (!rawName || !rawComuna) continue;
            
            const nameLower = rawName.toLowerCase();
            if (nameLower.includes("laurita") || nameLower.includes("clini") || nameLower.includes("bupa") || nameLower.includes("ancora") || nameLower.includes("áncora") || nameLower.includes("alejandro del rio") || nameLower.includes("alejandro del río") || nameLower.includes("karol wojtyla") || nameLower.includes("sotero del rio") || nameLower.includes("sótero del río") || nameLower.includes("alemana de santiago") || nameLower.includes("clinica redsalud vitacura") || nameLower.includes("redsalud vitacura")) {
                continue;
            }
            
            // Homologación robusta basada en la LISTA de tipos chilena
            let tipo = "Otro";
            const typeStr = rawTipo.toLowerCase();
            
            if (typeStr.includes("cesfam") || nameLower.includes("cesfam")) {
                tipo = "CESFAM";
            } else if (typeStr.includes("cecosf") || nameLower.includes("cecosf")) {
                tipo = "CECOSF";
            } else if (typeStr.includes("posta de salud rural") || typeStr.includes("posta rural") || nameLower.includes("posta rural") || nameLower.includes("psr")) {
                tipo = "Posta de Salud Rural (PSR)";
            } else if (typeStr.includes("estacion medico rural") || typeStr.includes("estación médico rural") || nameLower.includes("emr")) {
                tipo = "Estación Médico Rural (EMR)";
            } else if (typeStr.includes("sapu") || nameLower.includes("sapu")) {
                tipo = "SAPU";
            } else if (typeStr.includes("sar") || nameLower.includes("sar")) {
                tipo = "SAR";
            } else if (typeStr.includes("sur") || nameLower.includes("sur")) {
                tipo = "SUR";
            } else if (typeStr.includes("hospital") || nameLower.includes("hospital")) {
                tipo = "Hospital";
            } else if (typeStr.includes("cosam") || nameLower.includes("cosam")) {
                tipo = "COSAM";
            } else if (typeStr.includes("cae") || typeStr.includes("cdt") || nameLower.includes("cae") || nameLower.includes("cdt") || typeStr.includes("consultorio adosado") || typeStr.includes("centro de diagnostico")) {
                tipo = "CAE / CDT";
            } else if (typeStr.includes("clinica") || typeStr.includes("clínica") || nameLower.includes("clinica") || nameLower.includes("clínica")) {
                tipo = "Clínica";
            } else if (nameLower.includes("mutual de seguridad") || nameLower.includes("achs") || nameLower.includes("ist") || nameLower.includes("asociacion chilena de seguridad") || nameLower.includes("instituto de seguridad del trabajo") || typeStr.includes("salud laboral")) {
                tipo = "Centro de Salud Laboral";
            } else if (typeStr.includes("centro medico") || typeStr.includes("centro médico") || nameLower.includes("centro medico") || nameLower.includes("centro médico") || nameLower.includes("integramedica") || nameLower.includes("megasalud")) {
                tipo = "Centro Médico";
            } else {
                if (typeStr.includes("consultorio") || nameLower.includes("consultorio")) {
                    tipo = "Centro Médico";
                } else {
                    tipo = "Otro";
                }
            }
            
            let categoria = "Público";
            if (tipo === "Clínica" || tipo === "Centro de Salud Laboral" || rawDep.toLowerCase().includes("privado") || nameLower.includes("alemana") || nameLower.includes("redsalud") || nameLower.includes("bupa") || nameLower.includes("integramedica") || nameLower.includes("megasalud") || nameLower.includes("mutual") || nameLower.includes("achs") || nameLower.includes("ist")) {
                categoria = "Privado";
            }
            
            const matched = findBestMatch(rawRegion, rawComuna);
            
            const viaGlosa = row[viaIdx] || '';
            const viaNom = row[viaNomIdx] || '';
            const viaNum = row[viaNumIdx] || '';
            
            let direccion = "";
            if (viaNom) {
                direccion = `${viaGlosa} ${viaNom} ${viaNum}`.trim().replace(/\s+/g, ' ');
            } else {
                direccion = "Calle Principal S/N";
            }
            
            let lat = isNaN(rawLat) ? 0 : rawLat;
            let lng = isNaN(rawLng) ? 0 : rawLng;
            
            if (lat > 0) lat = -lat;
            if (lng > 0) lng = -lng;
            
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
                region: matched.region,
                comuna: matched.comuna,
                direccion: direccion,
                telefono: row[telIdx] || "Llamar al Centro / Consultar OIRS",
                latitud: Math.round(lat * 100000) / 100000,
                longitud: Math.round(lng * 100000) / 100000,
                dependencia: rawDep
            });
        }
        
        console.log(`Procesados ${outputCenters.length} centros de salud oficiales de Chile mapeados.`);
        
        const publicDir = path.join(__dirname, "../public/data");
        const srcDir = path.join(__dirname, "../src/data");
        fs.mkdirSync(publicDir, { recursive: true });
        fs.mkdirSync(srcDir, { recursive: true });
        
        fs.writeFileSync(path.join(publicDir, "centros_medicos.json"), JSON.stringify(outputCenters, null, 2), "utf-8");
        fs.writeFileSync(path.join(srcDir, "centros_medicos_preview.json"), JSON.stringify(outputCenters.slice(0, 50), null, 2), "utf-8");
        
        console.log("¡Base de datos JSON oficial de datos.gob.cl generada correctamente!");
    } catch (e) {
        console.error("Error al descargar/procesar los datos oficiales:", e);
    }
}

run();
