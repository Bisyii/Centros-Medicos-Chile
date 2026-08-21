import { X, MapPin, Phone, Building, ExternalLink, Calendar, Share2 } from 'lucide-react';
import type { CentroMedico } from '../types';
import { MapView } from './MapView';

interface DetailModalProps {
  centro: CentroMedico | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ centro, onClose }) => {
  if (!centro) return null;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: centro.nombre,
        text: `Encuentra el ${centro.nombre} en ${centro.direccion}, ${centro.comuna}.`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(`${centro.nombre}\nDirección: ${centro.direccion}, ${centro.comuna}\nTeléfono: ${centro.telefono}`);
      alert('¡Información del centro médico copiada al portapapeles!');
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centro.nombre} ${centro.direccion} ${centro.comuna} Chile`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header modal */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div>
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border mb-2 ${
              centro.categoria === 'Público' 
                ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                : 'bg-rose-100/50 text-rose-800 border border-rose-300/40'
            }`}>
              {centro.categoria} • {centro.tipo}
            </span>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {centro.nombre}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Mapa de ubicación */}
          <MapView centro={centro} />

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dirección</p>
                <p className="text-slate-700 font-medium">{centro.direccion}</p>
                <p className="text-slate-500 text-sm">{centro.comuna}, Región {centro.region}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contacto</p>
                <a href={`tel:${centro.telefono}`} className="text-rose-600 font-medium hover:underline">
                  {centro.telefono}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Building className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dependencia Administrativa</p>
                <p className="text-slate-700 font-medium">{centro.dependencia}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Horario de Atención</p>
                <p className="text-slate-700 text-sm">Lunes a Viernes: 08:00 - 20:00 hrs</p>
                <p className="text-slate-500 text-xs mt-0.5">*Sujeto a disponibilidad del establecimiento en días festivos.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Acciones del Footer */}
        <div className="p-5 border-t border-slate-100 flex gap-3 bg-slate-50">
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white py-2.5 px-4 rounded-xl font-semibold shadow-sm hover:shadow-md transition-all text-sm cursor-pointer"
          >
            <ExternalLink className="h-4 w-4" />
            Cómo Llegar (Google Maps)
          </a>
          <button
            onClick={handleShare}
            className="flex items-center justify-center p-2.5 border border-slate-200 hover:border-slate-300 bg-white text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            title="Compartir Centro"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
