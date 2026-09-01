interface MapEmbedProps {
  /** Identificador del elemento, para engancharlo desde fuera. */
  id?: string;
  latitude: number;
  longitude: number;
  label?: string;
  className?: string;
  /** Cuando el mapa es solo fondo: fuera del tabulador y del lector de pantalla. */
  decorative?: boolean;
}

export function MapEmbed({ id, latitude, longitude, label, className, decorative = false }: MapEmbedProps) {
  const src = `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`;

  return (
    <iframe
      id={id}
      title={label ? `Mapa de ${label}` : 'Mapa de ubicación'}
      src={src}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      tabIndex={decorative ? -1 : undefined}
      aria-hidden={decorative || undefined}
    />
  );
}
