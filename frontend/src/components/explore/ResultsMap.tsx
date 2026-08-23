import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/utils';

const pinIcon = (color: string) =>
  L.divIcon({
    className: '',
    html: `<svg width="30" height="38" viewBox="0 0 24 24" fill="${color}" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,0.3))"><path d="M12 2C7.6 2 4 5.6 4 10c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"/><circle cx="12" cy="10" r="3" fill="#fff"/></svg>`,
    iconSize: [30, 38],
    iconAnchor: [15, 38],
    popupAnchor: [0, -34],
  });

const productPin = pinIcon('#0EA5E9');

function FitBounds({ points }: { points: [number, number][] }) {
  const map = useMap();
  useMemo(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 14);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points.map((p) => p.join(',')).join('|')]);
  return null;
}

export function ResultsMap({ products }: { products: Product[] }) {
  const navigate = useNavigate();

  const located = products.filter(
    (p): p is Product & { userEnterprise: NonNullable<Product['userEnterprise']> & { latitude: number; longitude: number } } =>
      Boolean(p.userEnterprise?.latitude && p.userEnterprise?.longitude),
  );
  const points: [number, number][] = located.map((p) => [p.userEnterprise.latitude, p.userEnterprise.longitude]);
  const center: [number, number] = points[0] ?? [23.1136, -82.3666];

  return (
    <MapContainer center={center} zoom={13} scrollWheelZoom style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds points={points} />
      {located.map((product) => (
        <Marker
          key={product.idProduct}
          position={[product.userEnterprise.latitude, product.userEnterprise.longitude]}
          icon={productPin}
          eventHandlers={{ click: () => navigate(`/productos/${product.idProduct}`) }}
        >
          <Popup>
            <p className="font-semibold text-ink-900">{product.name}</p>
            <p className="text-secondary font-bold">{formatPrice(product.priceUsd, 'USD') ?? formatPrice(product.priceCup, 'CUP')}</p>
            <p className="text-xs text-ink-500">{product.userEnterprise.companyName}</p>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
