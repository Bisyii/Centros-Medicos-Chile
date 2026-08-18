import { useState, useEffect, useMemo } from 'react';
import { Heart, ShieldCheck, MapPin, Database, Award, HelpCircle } from 'lucide-react';
import type { CentroMedico } from './types';
import { Filters } from './components/Filters';
import { MedicalCenterCard } from './components/MedicalCenterCard';
import { DetailModal } from './components/DetailModal';

export default function App() {
  const [centros, setCentros] = useState<CentroMedico[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedComuna, setSelectedComuna] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('');
  const [selectedTipo, setSelectedTipo] = useState('');

  // Centro médico seleccionado para el modal
  const [selectedCentro, setSelectedCentro] = useState<CentroMedico | null>(null);

  // Cargar datos
  useEffect(() => {
    fetch('/data/centros_medicos.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error('Error al cargar la base de datos de centros médicos.');
        }
        return res.json();
      })
      .then((data: CentroMedico[]) => {
        setCentros(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Cantidad de elementos a mostrar inicialmente y por lote
  const [visibleCount, setVisibleCount] = useState(24);

  // Función auxiliar para normalizar texto eliminando tildes y diacríticos
  const cleanText = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  };

  // Filtrado reactivo en el cliente
  const filteredCentros = useMemo(() => {
    const cleanSearch = cleanText(searchTerm);
    return centros.filter((c) => {
      const matchSearch = cleanSearch === '' || 
        cleanText(c.nombre).includes(cleanSearch) ||
        cleanText(c.direccion).includes(cleanSearch) ||
        cleanText(c.comuna).includes(cleanSearch);
      
      const matchRegion = selectedRegion === '' || c.region === selectedRegion;
      const matchComuna = selectedComuna === '' || c.comuna === selectedComuna;
      const matchCategoria = selectedCategoria === '' || c.categoria === selectedCategoria;
      const matchTipo = selectedTipo === '' || c.tipo === selectedTipo;

      return matchSearch && matchRegion && matchComuna && matchCategoria && matchTipo;
    });
  }, [centros, searchTerm, selectedRegion, selectedComuna, selectedCategoria, selectedTipo]);

  // Resetear cantidad visible cuando cambian los filtros
  useEffect(() => {
    setVisibleCount(24);
  }, [searchTerm, selectedRegion, selectedComuna, selectedCategoria, selectedTipo]);

  // Obtener solo los elementos visibles actualmente
  const visibleCentros = useMemo(() => {
    return filteredCentros.slice(0, visibleCount);
  }, [filteredCentros, visibleCount]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedComuna('');
    setSelectedCategoria('');
    setSelectedTipo('');
  };

  // Cargar más elementos
  const loadMore = () => {
    if (visibleCount < filteredCentros.length) {
      setVisibleCount((prev) => prev + 24);
    }
  };

  // Configurar IntersectionObserver para disparar loadMore cuando se llega al final
  const observerRef = (node: HTMLDivElement | null) => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(node);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white text-center py-2.5 px-4 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 shadow-sm">
        <ShieldCheck className="h-4 w-4 text-emerald-400" />
        Plataforma 100% gratuita y colaborativa de salud chilena
      </div>

      {/* Main Header */}
      <header className="bg-white border-b border-slate-200 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-md shadow-blue-500/25">
              <Heart className="h-7 w-7 fill-white/10" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                SaludChile <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-md border border-blue-200">BETA</span>
              </h1>
              <p className="text-slate-500 text-sm mt-0.5">Buscador y directorio oficial de centros de salud públicos y privados de Chile</p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-sm text-slate-600 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-1.5">
              <Database className="h-4 w-4 text-blue-600" />
              <span className="font-bold text-slate-800">{centros.length}</span> Establecimientos
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-blue-600" />
              Todas las comunas
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8">
        {/* Filtros */}
        <Filters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          selectedComuna={selectedComuna}
          setSelectedComuna={setSelectedComuna}
          selectedCategoria={selectedCategoria}
          setSelectedCategoria={setSelectedCategoria}
          selectedTipo={selectedTipo}
          setSelectedTipo={setSelectedTipo}
          onClearFilters={handleClearFilters}
        />

        {/* Carga o Errores */}
        {loading && (
          <div className="py-20 text-center space-y-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="text-slate-500 font-medium">Cargando centros de salud del país...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl text-center max-w-md mx-auto my-8">
            <h3 className="font-bold text-lg mb-1">Ocurrió un error</h3>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Listado de Resultados */}
        {!loading && !error && (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-slate-500 font-medium">
                Mostrando <span className="font-bold text-slate-800">{visibleCentros.length}</span> de <span className="font-bold text-slate-800">{filteredCentros.length}</span> establecimientos
              </p>
              {filteredCentros.length === 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-sm text-blue-600 font-semibold hover:underline"
                >
                  Limpiar filtros para ver todo
                </button>
              )}
            </div>

            {filteredCentros.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {visibleCentros.map((centro) => (
                    <MedicalCenterCard
                      key={centro.id}
                      centro={centro}
                      onSelect={setSelectedCentro}
                    />
                  ))}
                </div>

                {/* Elemento de trigger del Infinite Scroll */}
                {visibleCount < filteredCentros.length && (
                  <div ref={observerRef} className="py-10 text-center flex justify-center">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-blue-600 border-r-transparent" />
                    <span className="ml-2 text-slate-500 text-sm font-semibold">Cargando más centros...</span>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto">
                <HelpCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">Sin resultados</h3>
                <p className="text-slate-500 text-sm">
                  Prueba cambiando los términos de búsqueda o eliminando filtros activos.
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Detail Modal */}
      <DetailModal
        centro={selectedCentro}
        onClose={() => setSelectedCentro(null)}
      />

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-blue-600/20 p-2 rounded-xl text-blue-500">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-white font-bold tracking-tight">SaludChile</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Award className="h-4 w-4 text-amber-500" />
            Datos recopilados de fuentes de Datos Abiertos del Gobierno de Chile y DEIS.
          </div>
          <p className="text-xs">
            © {new Date().getFullYear()} SaludChile. Proyecto libre y gratuito.
          </p>
        </div>
      </footer>
    </div>
  );
}
