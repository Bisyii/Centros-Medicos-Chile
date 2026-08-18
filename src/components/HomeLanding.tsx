import React from 'react';
import { Heart, Search, ShieldCheck, MapPin, Phone, Award } from 'lucide-react';

interface HomeLandingProps {
  onStartSearch: () => void;
  onViewPrivacy: () => void;
}

export const HomeLanding: React.FC<HomeLandingProps> = ({ onStartSearch, onViewPrivacy }) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between font-sans">

      {/* Hero Section */}
      <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-8">
        <div className="space-y-6 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
            <Heart className="h-3.5 w-3.5 fill-emerald-700/10" />
            Acceso libre de costo
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Encuentra tu centro médico en <span className="text-emerald-600">un solo clic</span>
          </h1>
          
          <p className="text-lg text-slate-500">
            Busca y filtra al instante entre todos los centros de salud públicos y privados del país. Consulta horarios, direcciones verificadas y mapas de ubicación de forma rápida y sencilla.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onStartSearch}
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-500/20 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer animate-pulse"
            >
              <Search className="h-5 w-5" />
              Buscar Centros Médicos
            </button>
          </div>

          {/* Características */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-10 max-w-md mx-auto text-left border-t border-slate-200/60 mt-8">
            <div className="flex gap-3 items-start">
              <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 mt-0.5">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Todas las Comunas</h3>
                <p className="text-xs text-slate-400 mt-0.5">Desde Arica hasta Magallanes</p>
              </div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="bg-emerald-50 text-emerald-600 p-1.5 rounded-lg border border-emerald-100 mt-0.5">
                <Phone className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">Datos Oficiales</h3>
                <p className="text-xs text-slate-400 mt-0.5">Información real extraída del DEIS</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="bg-emerald-600/20 p-2 rounded-xl text-emerald-500">
              <Heart className="h-5 w-5" />
            </div>
            <span className="text-white font-bold tracking-tight">Centros Medicos Chile</span>
          </div>
          <div className="flex flex-col items-center md:items-end gap-1.5 text-xs">
            <div className="flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Información de utilidad pública provista por el Ministerio de Salud de Chile.</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              <span>Plataforma 100% gratuita y colaborativa de salud chilena.</span>
            </div>
            <div className="flex gap-4 mt-1">
              <button 
                onClick={onViewPrivacy} 
                className="hover:text-white transition-colors cursor-pointer underline"
              >
                Políticas de Privacidad
              </button>
              <span>|</span>
              <p>© {new Date().getFullYear()} Centros Medicos Chile. Proyecto libre y gratuito.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
