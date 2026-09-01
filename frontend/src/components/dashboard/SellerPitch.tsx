import { useState } from 'react';
import { Building2, Check, LayoutDashboard, MessageCircle, Package, Wrench } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { SELLER_PLAN, getTier, monthlyEquivalent } from '@/lib/plans';
import type { BillingCycle } from '@/lib/plans';
import { WHATSAPP_VENTAS } from '@/lib/contacto';
import { cn } from '@/lib/utils';

/**
 * Lo que verá quien entre al panel sin el plan de vendedor activo. En vez de
 * enseñarle el panel vacío —cero productos, cero servicios, plan «Inactivo»— se
 * le cuenta para qué sirve cada sección y cuánto cuesta tenerla.
 */

const SECCIONES = [
  {
    icono: LayoutDashboard,
    titulo: 'Resumen',
    texto: 'Cuántos productos y servicios tienes publicados, y cuántos días te quedan de plan.',
  },
  {
    icono: Package,
    titulo: 'Productos',
    texto: 'Publica tu catálogo con foto, precio en CUP o USD, unidad de venta y disponibilidad. Aparece en las búsquedas de tu ciudad.',
  },
  {
    icono: Wrench,
    titulo: 'Servicios',
    texto: 'Lo que no se vende por unidades: reparaciones, transporte, encargos. Con su precio y su descripción.',
  },
  {
    icono: Building2,
    titulo: 'Mi empresa',
    texto: 'Los datos que ven tus clientes: nombre, dirección en el mapa, teléfono y correo de contacto.',
  },
];

export function SellerPitch() {
  const { user } = useAuth();
  const [cycle, setCycle] = useState<BillingCycle>('quarterly');
  const tier = getTier(SELLER_PLAN, cycle);

  const mensaje = encodeURIComponent(
    `Hola, quiero activar el Plan Vendedor de Agora (${tier.label}, ${tier.cost} USD por ${tier.durationDays} días).` +
      (user ? ` Mi usuario es ${user.username}.` : ''),
  );
  const enlaceWhatsapp = `https://wa.me/${WHATSAPP_VENTAS}?text=${mensaje}`;

  return (
    <div id="pitch" className="pitch space-y-10">
      <header id="pitch__intro" className="pitch__intro max-w-xl">
        <span id="pitch__eyebrow" className="pitch__eyebrow text-xs font-semibold uppercase tracking-wider text-ink-500">
          Cuenta de negocio
        </span>
        <h2 id="pitch__title" className="pitch__title mt-2 text-2xl font-semibold text-ink-900">
          Tu catálogo, donde la gente lo busca
        </h2>
        <p id="pitch__text" className="pitch__text mt-3 text-sm leading-relaxed text-ink-600">
          Con el plan de vendedor activo, este panel pasa a ser el sitio desde donde publicas y
          gestionas todo lo que ofreces. Esto es lo que te espera dentro.
        </p>
      </header>

      <section id="pitch__sections" className="pitch__sections">
        <h3 id="pitch__sections-title" className="pitch__sections-title mb-4 text-[11px] font-semibold uppercase tracking-wide text-ink-500">
          Las cuatro secciones del panel
        </h3>
        <ul id="pitch__sections-list" className="pitch__sections-list grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SECCIONES.map(({ icono: Icono, titulo, texto }) => (
            <li
              key={titulo}
              id={`pitch__section--${titulo.toLowerCase().replace(/ /g, '-')}`}
              className="pitch__section flex gap-3 rounded-2xl border border-ink-200/80 bg-ink-50 p-5"
            >
              <span className="pitch__section-icon flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-ink-100 text-ink-700">
                <Icono size={17} aria-hidden="true" />
              </span>
              <div className="pitch__section-body">
                <p className="pitch__section-title font-medium text-ink-900">{titulo}</p>
                <p className="pitch__section-text mt-1 text-sm leading-relaxed text-ink-500">{texto}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section id="pitch__plan" className="pitch__plan rounded-2xl border-2 border-primary bg-primary-light/40 p-7">
        <h3 id="pitch__plan-title" className="pitch__plan-title text-lg font-semibold text-ink-900">{SELLER_PLAN.name}</h3>
        <p id="pitch__plan-subtitle" className="pitch__plan-subtitle mt-1 text-sm text-ink-500">
          Elige cada cuánto quieres pagarlo. Puedes cambiarlo más adelante.
        </p>

        {/* Un ciclo u otro: opciones excluyentes con radios nativos. */}
        <fieldset id="pitch__cycles" className="pitch__cycles mt-5">
          <legend className="sr-only">Ciclo de facturación</legend>
          <div className="pitch__cycles-row grid grid-cols-3 gap-1.5 rounded-xl bg-ink-50 p-1">
            {SELLER_PLAN.tiers.map((t) => (
              <label
                key={t.cycle}
                id={`pitch__cycle--${t.cycle}`}
                className={cn(
                  'pitch__cycle cursor-pointer rounded-lg py-2 text-center text-sm font-medium transition-colors',
                  'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-primary/20',
                  t.cycle === cycle ? 'bg-primary text-white' : 'text-ink-600 hover:bg-ink-100',
                )}
              >
                <input
                  type="radio"
                  name="pitch-cycle"
                  value={t.cycle}
                  checked={t.cycle === cycle}
                  onChange={() => setCycle(t.cycle)}
                  id={`pitch__cycle-input--${t.cycle}`}
                  className="pitch__cycle-input sr-only"
                />
                {t.label}
              </label>
            ))}
          </div>
        </fieldset>

        <p id="pitch__price" className="pitch__price mt-6 flex flex-wrap items-baseline gap-2">
          <span id="pitch__cost" className="pitch__cost text-3xl font-semibold text-ink-900">${tier.cost}</span>
          <span id="pitch__period" className="pitch__period text-sm text-ink-500">/ {tier.durationDays} días</span>
          <span id="pitch__monthly" className="pitch__monthly text-sm text-ink-500">
            (${monthlyEquivalent(tier).toFixed(2)} al mes)
          </span>
          {tier.savingsLabel && (
            <span id="pitch__savings" className="pitch__savings ml-auto rounded-full bg-secondary-dark px-2.5 py-1 text-xs font-semibold text-white">
              {tier.savingsLabel}
            </span>
          )}
        </p>

        <ul id="pitch__features" className="pitch__features mt-5 space-y-2.5 text-sm text-ink-600">
          {SELLER_PLAN.features.map((feature) => (
            <li key={feature} className="pitch__feature flex items-center gap-2">
              <Check size={14} className="shrink-0 text-ink-900" aria-hidden="true" /> {feature}
            </li>
          ))}
        </ul>

        {/* El cobro se gestiona fuera de la plataforma: el alta se pide por WhatsApp. */}
        <a
          href={enlaceWhatsapp}
          target="_blank"
          rel="noreferrer"
          id="pitch__whatsapp"
          className="pitch__whatsapp mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <MessageCircle size={16} aria-hidden="true" />
          Solicitar el plan {tier.label.toLowerCase()} por WhatsApp
        </a>
        <p id="pitch__note" className="pitch__note mt-3 text-center text-xs text-ink-500">
          Te escribimos para confirmar el pago y activamos tu cuenta de negocio.
        </p>
      </section>
    </div>
  );
}
