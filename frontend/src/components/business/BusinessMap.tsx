import { MapContainer, Marker, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/**
 * Mapa decorativo de la cabecera del negocio. Va con Leaflet y no con el iframe
 * de Google porque el marcador de Google vive dentro de un iframe de otro
 * origen: no se puede animar ni tocar. Aquí el marcador es HTML nuestro.
 */
const pinLatido = L.divIcon({
  className: '',
  html: `
    <span class="map-pin">
      <span class="map-pin__halo"></span>
      <svg class="map-pin__body" width="34" height="42" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/>
        <circle cx="12" cy="10" r="3" fill="#fff"/>
      </svg>
    </span>`,
  iconSize: [34, 42],
  iconAnchor: [17, 42],
});

interface BusinessMapProps {
  latitude: number;
  longitude: number;
  className?: string;
}

export function BusinessMap({ latitude, longitude, className }: BusinessMapProps) {
  return (
    <MapContainer
      center={[latitude, longitude]}
      zoom={16}
      className={className}
      // Decorativo: ni se arrastra, ni hace zoom, ni entra en el tabulador.
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      attributionControl
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[latitude, longitude]} icon={pinLatido} />
    </MapContainer>
  );
}
