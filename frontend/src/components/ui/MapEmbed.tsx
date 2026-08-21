interface MapEmbedProps {
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
}

export function MapEmbed({ latitude, longitude, label, className }: MapEmbedProps) {
  const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;

  return (
    <iframe
      title={label ? `Mapa de ${label}` : 'Mapa de ubicación'}
      src={src}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
    />
  );
}
