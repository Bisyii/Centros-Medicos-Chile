import { useState } from 'react';
import { X, MapPin, Phone, Building, ExternalLink, Calendar, Share2, AlertTriangle, CheckCircle } from 'lucide-react';
import type { CentroMedico } from '../types';
import { MapView } from './MapView';

interface DetailModalProps {
  centro: CentroMedico | null;
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ centro, onClose }) => {
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);

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

  const handleSendReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportReason) return;

    // Guardar en localStorage para simulación local y persistencia del usuario
    const existingReports = JSON.parse(localStorage.getItem('reported_centers') || '[]');
    existingReports.push({
      id: centro.id,
      nombre: centro.nombre,
      motivo: reportReason,
      fecha: new Date().toISOString()
    });
    localStorage.setItem('reported_centers', JSON.stringify(existingReports));

    setReportSubmitted(true);
    setTimeout(() => {
      // Regresar al estado inicial del modal después de enviar
      setShowReportForm(false);
      setReportSubmitted(false);
      setReportReason('');
    }, 2500);
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${centro.nombre} ${centro.direccion} ${centro.comuna} Chile`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 flex flex-col max-h-[90vh]">
        {/* Header modal */}
        <div className="flex items-start justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="space-y-1">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide border ${
                centro.categoria === 'Público' 
                  ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                  : 'bg-rose-100/50 text-rose-800 border border-rose-300/40'
              }`}>
                {centro.categoria} • {centro.tipo}
              </span>
              {centro.verificacion_sis?.acreditado && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide bg-emerald-50 text-emerald-700 border border-emerald-200" title={`Código Registro SIS: ${centro.verificacion_sis.codigo_registro}`}>
                  🛡️ SIS Acreditado
                </span>
              )}
              {centro.verificacion_google?.estado_funcionamiento === 'OPERATIONAL' && (
                <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide bg-blue-50 text-blue-700 border border-blue-200">
                  📍 Verificado Google
                </span>
              )}
            </div>
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
          {showReportForm ? (
            <div className="py-4 space-y-4">
              {reportSubmitted ? (
                <div className="text-center py-6 space-y-3">
                  <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto animate-bounce" />
                  <h3 className="font-bold text-lg text-slate-800">¡Reporte Enviado!</h3>
                  <p className="text-sm text-slate-500">Gracias por ayudarnos a mantener la base de datos actualizada.</p>
                </div>
              ) : (
                <form onSubmit={handleSendReport} className="space-y-4">
                  <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Reportar problema con este centro</span>
                  </div>
                  <p className="text-slate-500 text-xs">
                    Selecciona el motivo del reporte para que nuestro equipo pueda verificar y corregir la información.
                  </p>
                  
                  <div className="space-y-2">
                    {[
                      { label: "El centro está cerrado permanentemente", value: "closed" },
                      { label: "Dirección incorrecta", value: "wrong_address" },
                      { label: "Teléfono incorrecto o no responde", value: "wrong_phone" },
                      { label: "El centro cambió de nombre o categoría", value: "wrong_info" },
                      { label: "Otro motivo", value: "other" }
                    ].map((opt) => (
                      <label key={opt.value} className="flex items-center gap-3 p-3 border border-slate-200 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors">
                        <input
                          type="radio"
                          name="report_reason"
                          value={opt.value}
                          checked={reportReason === opt.value}
                          onChange={(e) => setReportReason(e.target.value)}
                          className="accent-rose-600"
                          required
                        />
                        <span className="text-sm font-medium text-slate-700">{opt.label}</span>
                      </label>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowReportForm(false)}
                      className="flex-1 py-2 px-4 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors shadow-sm"
                    >
                      Enviar Reporte
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <>
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

              {/* Botón discreto de reporte */}
              <div className="pt-2 text-center">
                <button
                  onClick={() => setShowReportForm(true)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  ¿Información errónea o centro cerrado? Reportar aquí
                </button>
              </div>
            </>
          )}
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
