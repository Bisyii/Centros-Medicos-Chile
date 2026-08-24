import React from 'react';
import { Heart, Search, ShieldCheck, MapPin, Award, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HomeLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-600 p-2 rounded-xl text-white">
              <Heart className="h-5 w-5 fill-white/10" />
            </div>
            <span className="text-slate-900 font-extrabold tracking-tight text-lg">MedFinder Chile</span>
          </div>
          <Link
            to="/buscar"
            className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold py-2 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
          >
            Buscar Ahora
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow max-w-5xl w-full mx-auto px-6 py-16 md:py-24 flex flex-col items-center justify-center text-center gap-12">
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 fill-rose-700/10" />
            Directorio de Salud Gratuito
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
            Encuentra tu centro médico en <span className="text-rose-600">un solo clic</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            Busca y filtra al instante entre todos los centros de salud públicos y privados del país. Consulta horarios, direcciones verificadas y mapas de ubicación de forma rápida y sencilla.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/buscar"
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white text-lg font-bold py-4 px-10 rounded-2xl shadow-lg shadow-rose-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2.5 group cursor-pointer text-center"
            >
              <Search className="h-5 w-5 transition-transform group-hover:scale-110" />
              Comenzar Búsqueda
            </Link>
          </div>
        </div>

        {/* Features / Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-6">
          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-100 w-fit mb-4">
              <MapPin className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Todas las Regiones</h3>
            <p className="text-sm text-slate-500 mt-2">Cobertura nacional desde Arica hasta Magallanes.</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-100 w-fit mb-4">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Públicos y Privados</h3>
            <p className="text-sm text-slate-500 mt-2">Hospitales, clínicas, CESFAM, SAPU y más.</p>
          </div>

          <div className="bg-white border border-slate-200/80 p-6 rounded-2xl text-left shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-rose-50 text-rose-600 p-2.5 rounded-xl border border-rose-100 w-fit mb-4">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Datos Oficiales</h3>
            <p className="text-sm text-slate-500 mt-2">Información del DEIS y Ministerio de Salud.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-rose-600/20 p-2 rounded-xl text-rose-500">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-white font-bold tracking-tight">MedFinder Chile</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Información de utilidad pública provista por el Ministerio de Salud de Chile.</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-rose-500 shrink-0" />
              <span>Plataforma 100% gratuita y colaborativa de salud chilena.</span>
            </div>
            <div className="flex gap-4 mt-1">
              <Link 
                to="/privacidad" 
                className="hover:text-white transition-colors cursor-pointer underline"
              >
                Políticas de Privacidad
              </Link>
              <span>|</span>
              <p>© {new Date().getFullYear()} MedFinder Chile. Proyecto libre y gratuito.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
