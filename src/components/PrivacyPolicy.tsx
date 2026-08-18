import React from 'react';
import { Shield, ArrowLeft } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        
        {/* Botón Volver */}
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-blue-600 transition-colors font-semibold mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al buscador
        </button>

        {/* Título */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-6 mb-6">
          <div className="bg-blue-100 p-2.5 rounded-2xl text-blue-600">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Políticas de Privacidad
            </h1>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Última actualización: Agosto 2026</p>
          </div>
        </div>

        {/* Contenido de la Política */}
        <div className="space-y-6 text-slate-600 text-sm leading-relaxed">
          
          <section>
            <h2 className="text-base font-bold text-slate-800 mb-2">1. Información General</h2>
            <p>
              SaludChile es una plataforma informativa gratuita que proporciona un buscador y directorio georreferenciado de centros de salud públicos y privados en Chile. Respetamos la privacidad de nuestros usuarios y nos comprometemos a proteger la información que recopilamos de acuerdo con la legislación vigente chilena y los estándares de Google AdSense.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-800 mb-2">2. Datos Recopilados</h2>
            <p>
              Nuestra aplicación no solicita, almacena ni procesa datos personales de los usuarios (como nombres, correos electrónicos, RUT o registros médicos). 
            </p>
            <p className="mt-2">
              <strong>Geolocalización:</strong> Si utilizas la función de búsqueda por cercanía, el navegador solicitará permiso para acceder a tu ubicación GPS. Esta información se procesa 100% de forma local en tu dispositivo y nunca es transmitida ni guardada en servidores externos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-800 mb-2">3. Cookies y Google AdSense</h2>
            <p>
              Utilizamos proveedores de publicidad de terceros, incluido <strong>Google AdSense</strong>, para mostrar anuncios cuando visitas nuestro sitio web. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1.5">
              <li>Google utiliza cookies para publicar anuncios basados en tus visitas anteriores a este sitio web o a otros sitios de internet.</li>
              <li>El uso de cookies de publicidad permite a Google y a sus socios mostrar anuncios basados en las visitas realizadas a nuestro sitio o a otros sitios de internet.</li>
              <li>Puedes inhabilitar la publicidad personalizada visitando la sección de <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Configuración de anuncios de Google</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-800 mb-2">4. Enlaces a Terceros</h2>
            <p>
              Nuestra página web contiene enlaces a otros sitios de interés, como Google Maps para indicaciones de ruta y teléfonos directos de clínicas. No tenemos control sobre las políticas de privacidad o contenidos de dichos sitios externos.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-slate-800 mb-2">5. Contacto</h2>
            <p>
              Si tienes preguntas sobre nuestra política de privacidad, puedes contactarnos a través de nuestro repositorio de desarrollo en GitHub.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
};
