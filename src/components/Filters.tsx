import React from 'react';
import { Search, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { REGIONES_COMUNAS } from '../types';

interface FiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedRegion: string;
  setSelectedRegion: (val: string) => void;
  selectedComuna: string;
  setSelectedComuna: (val: string) => void;
  selectedCategoria: string;
  setSelectedCategoria: (val: string) => void;
  selectedTipo: string;
  setSelectedTipo: (val: string) => void;
  onClearFilters: () => void;
}

export const Filters: React.FC<FiltersProps> = ({
  searchTerm,
  setSearchTerm,
  selectedRegion,
  setSelectedRegion,
  selectedComuna,
  setSelectedComuna,
  selectedCategoria,
  setSelectedCategoria,
  selectedTipo,
  setSelectedTipo,
  onClearFilters,
}) => {
  // Comunas correspondientes a la región seleccionada
  const comunasDisponibles = selectedRegion ? REGIONES_COMUNAS[selectedRegion] || [] : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 font-semibold text-slate-800">
          <SlidersHorizontal className="h-4.5 w-4.5 text-blue-600" />
          <span>Filtros de Búsqueda</span>
        </div>
        <button
          onClick={onClearFilters}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Restablecer Filtros
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Búsqueda por texto */}
        <div className="relative lg:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Buscar por nombre</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: Hospital Clínico, Clínica Alemana..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Selector de Región */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Región</label>
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setSelectedComuna(''); // Reset Comuna when Region changes
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Todas las regiones</option>
            {Object.keys(REGIONES_COMUNAS).map((reg) => (
              <option key={reg} value={reg}>{reg}</option>
            ))}
          </select>
        </div>

        {/* Selector de Comuna */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Comuna</label>
          <select
            value={selectedComuna}
            onChange={(e) => setSelectedComuna(e.target.value)}
            disabled={!selectedRegion}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            <option value="">{selectedRegion ? 'Todas las comunas' : 'Selecciona una región'}</option>
            {comunasDisponibles.map((com) => (
              <option key={com} value={com}>{com}</option>
            ))}
          </select>
        </div>

        {/* Selector de Categoria (Público/Privado) */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Tipo Administración</label>
          <select
            value={selectedCategoria}
            onChange={(e) => setSelectedCategoria(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="">Público y Privado</option>
            <option value="Público">Solo Público</option>
            <option value="Privado">Solo Privado</option>
          </select>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-50">
        <span className="text-xs font-semibold text-slate-400 mr-2 self-center uppercase tracking-wider">Tipo Establecimiento:</span>
        {['Todos', 'CESFAM', 'Hospital', 'SAPU / SAR', 'Clínica', 'Centro Médico'].map((tipo) => {
          const isSelected = selectedTipo === (tipo === 'Todos' ? '' : tipo);
          return (
            <button
              key={tipo}
              onClick={() => setSelectedTipo(tipo === 'Todos' ? '' : tipo)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {tipo}
            </button>
          );
        })}
      </div>
    </div>
  );
};
