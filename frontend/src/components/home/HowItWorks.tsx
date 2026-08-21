import { Search, MessageCircle, Star } from 'lucide-react';

const steps = [
  {
    icon: Search,
    title: 'Busca y filtra',
    description: 'Encuentra productos por precio, categoría o cerca de tu ubicación con un clic.',
  },
  {
    icon: MessageCircle,
    title: 'Contacta al vendedor',
    description: 'Revisa la ficha del producto y comunícate directo con la mypime o mercado.',
  },
  {
    icon: Star,
    title: 'Visita y califica',
    description: 'Ve directo al vendedor sin rodeos y deja tu reseña para ayudar a otros usuarios.',
  },
];

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-6xl px-4 sm:px-6 py-16">
      <div className="mb-10 max-w-lg">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">Cómo funciona</span>
        <h2 className="mt-2 text-2xl sm:text-3xl font-semibold text-ink-900">Buscar en Agora toma tres pasos</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((step, i) => (
          <div key={step.title} className="relative rounded-2xl border border-ink-200/80 bg-white p-6">
            <span className="absolute -top-3 -left-1 text-5xl font-bold text-ink-100 select-none">{i + 1}</span>
            <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-ink-900 text-white">
              <step.icon size={19} />
            </div>
            <h3 className="relative mt-4 font-medium text-ink-900">{step.title}</h3>
            <p className="relative mt-1.5 text-sm leading-relaxed text-ink-500">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
