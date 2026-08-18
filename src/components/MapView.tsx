import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { CentroMedico } from '../types';

// Solución para renderizar correctamente los iconos de Leaflet en React (problema conocido de assets)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Componente para actualizar dinámicamente la vista del mapa cuando cambia el centro seleccionado
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  React.useEffect(() => {
    // Forzar rediseño de Leaflet al cambiar de centro (evita tiles grises o desalineamientos)
    map.invalidateSize();
    map.flyTo(center, 15, { animate: true, duration: 1.5 });
  }, [center, map]);
  return null;
}

interface MapViewProps {
  centro: CentroMedico | null;
}

export const MapView: React.FC<MapViewProps> = ({ centro }) => {
  if (!centro || !centro.latitud || !centro.longitud) {
    return (
      <div className="h-48 bg-slate-100 rounded-xl flex items-center justify-center border border-slate-200 text-slate-400 text-sm">
        Mapa no disponible
      </div>
    );
  }

  const position: [number, number] = [centro.latitud, centro.longitud];

  return (
    <div className="h-56 w-full rounded-xl overflow-hidden border border-slate-200 shadow-inner relative z-10">
      <MapContainer 
        center={position} 
        zoom={15} 
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <div className="font-sans text-xs">
              <p className="font-bold text-slate-800">{centro.nombre}</p>
              <p className="text-slate-600 mt-1">{centro.direccion}</p>
            </div>
          </Popup>
        </Marker>
        <ChangeView center={position} />
      </MapContainer>
    </div>
  );
};
