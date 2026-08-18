import React from 'react';
import { MapPin, Phone, Building, ExternalLink } from 'lucide-react';
import type { CentroMedico } from '../types';

interface MedicalCenterCardProps {
  centro: CentroMedico;
  onSelect: (centro: CentroMedico) => void;
}

export const MedicalCenterCard: React.FC<MedicalCenterCardProps> = ({ centro, onSelect }) => {
  const isPublico = centro.categoria === 'Público';

  return (
    <div 
      onClick={() => onSelect(centro)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-md cursor-pointer"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors ${
            isPublico 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-emerald-100/50 text-emerald-800 border border-emerald-300/40'
          }`}>
            {centro.categoria} • {centro.tipo}
          </span>
        </div>

        <h3 className="text-lg font-bold text-slate-800 line-clamp-2 group-hover:text-emerald-600 transition-colors mb-4">
          {centro.nombre}
        </h3>

        <div className="space-y-2 text-sm text-slate-600">
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{centro.direccion}, {centro.comuna}</span>
          </div>

          {centro.telefono && (
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{centro.telefono}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-slate-100">
            <Building className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{centro.dependencia}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-end text-xs font-semibold text-emerald-600 group-hover:underline pt-2">
        Ver Detalles e Indicaciones
        <ExternalLink className="ml-1 h-3.5 w-3.5" />
      </div>
    </div>
  );
};
