import type { Product, Rating, Service, UserEnterprise } from '@/types';

/**
 * Sample catalog used only as a local-dev fallback (see the interceptor in
 * api/client.ts) so the app has something to show right after `git clone`
 * + `npm run dev`, without needing the real backend running. Never reaches
 * a production build — import.meta.env.DEV gates both this file's only
 * import site and every place that reads from it.
 */

export const MOCK_ENTERPRISES: UserEnterprise[] = [
  {
    idUserEnterprise: 'mock-ent-1',
    userId: 'mock-user-1',
    companyName: 'Mercado Central',
    address: { street: 'Calle 23 e/ N y O', city: 'La Habana', state: 'La Habana', zipCode: '10400', country: 'Cuba' },
    contact: { email: 'contacto@mercadocentral.example', phone: '+53 5 555 0101', website: undefined },
    officeHours: null,
    code: 101,
    latitude: 23.1367,
    longitude: -82.3831,
  },
  {
    idUserEnterprise: 'mock-ent-2',
    userId: 'mock-user-2',
    companyName: 'Mypime La Esquina',
    address: { street: 'Ave 41 #2205', city: 'La Habana', state: 'La Habana', zipCode: '11300', country: 'Cuba' },
    contact: { email: 'ventas@laesquina.example', phone: '+53 5 555 0202', website: undefined },
    officeHours: null,
    code: 102,
    latitude: 23.1197,
    longitude: -82.4102,
  },
  {
    idUserEnterprise: 'mock-ent-3',
    userId: 'mock-user-3',
    companyName: 'Agromercado Vedado',
    address: { street: 'Calle L e/ 25 y 27', city: 'La Habana', state: 'La Habana', zipCode: '10400', country: 'Cuba' },
    contact: { email: 'info@agrovedado.example', phone: '+53 5 555 0303', website: undefined },
    officeHours: null,
    code: 103,
    latitude: 23.1408,
    longitude: -82.3897,
  },
  {
    idUserEnterprise: 'mock-ent-4',
    userId: 'mock-user-4',
    companyName: 'Farmacia San Rafael',
    address: { street: 'Calle San Rafael #456', city: 'La Habana', state: 'La Habana', zipCode: '10100', country: 'Cuba' },
    contact: { email: 'atencion@sanrafael.example', phone: '+53 5 555 0404', website: undefined },
    officeHours: null,
    code: 104,
    latitude: 23.1355,
    longitude: -82.3589,
  },
];

interface MockProductSeed {
  id: string;
  name: string;
  category: string;
  priceUsd: number;
  priceCup: number;
  stock: boolean;
  enterpriseIndex: number;
  description: string;
  avgRating?: number;
}

const SEEDS: MockProductSeed[] = [
  { id: 'mock-p1', name: 'Arroz blanco 5kg', category: 'Alimentos', priceUsd: 4.5, priceCup: 1800, stock: true, enterpriseIndex: 0, description: 'Arroz de grano largo, saco de 5kg.', avgRating: 4.6 },
  { id: 'mock-p2', name: 'Frijoles negros 1kg', category: 'Alimentos', priceUsd: 2.2, priceCup: 900, stock: true, enterpriseIndex: 0, description: 'Frijoles negros secos, empacados al vacío.', avgRating: 4.3 },
  { id: 'mock-p3', name: 'Leche en polvo 800g', category: 'Alimentos', priceUsd: 6.8, priceCup: 2700, stock: false, enterpriseIndex: 0, description: 'Leche entera en polvo, lata de 800g.' },
  { id: 'mock-p4', name: 'Aceite de cocina 1L', category: 'Alimentos', priceUsd: 3.9, priceCup: 1550, stock: true, enterpriseIndex: 2, description: 'Aceite vegetal, botella de 1 litro.', avgRating: 4.1 },
  { id: 'mock-p5', name: 'Detergente en polvo 1kg', category: 'Limpieza', priceUsd: 3.5, priceCup: 1400, stock: true, enterpriseIndex: 1, description: 'Detergente en polvo para lavado a mano.', avgRating: 4.8 },
  { id: 'mock-p6', name: 'Jabón de baño (pack 3)', category: 'Limpieza', priceUsd: 1.2, priceCup: 480, stock: true, enterpriseIndex: 1, description: 'Pack de 3 jabones de tocador.' },
  { id: 'mock-p7', name: 'Papel higiénico x4', category: 'Limpieza', priceUsd: 2.8, priceCup: 1100, stock: false, enterpriseIndex: 1, description: 'Paquete de 4 rollos de papel higiénico.' },
  { id: 'mock-p8', name: 'Tomates frescos (kg)', category: 'Vegetales', priceUsd: 1.5, priceCup: 600, stock: true, enterpriseIndex: 2, description: 'Tomates frescos de cosecha local, por kg.', avgRating: 4.4 },
  { id: 'mock-p9', name: 'Aguacates (unidad)', category: 'Vegetales', priceUsd: 0.8, priceCup: 320, stock: true, enterpriseIndex: 2, description: 'Aguacates maduros, listos para consumir.' },
  { id: 'mock-p10', name: 'Plátanos (kg)', category: 'Vegetales', priceUsd: 1.0, priceCup: 400, stock: true, enterpriseIndex: 2, description: 'Plátanos fruta, por kg.' },
  { id: 'mock-p11', name: 'Paracetamol 500mg (caja)', category: 'Farmacia', priceUsd: 2.5, priceCup: 1000, stock: true, enterpriseIndex: 3, description: 'Caja de 20 tabletas, 500mg.', avgRating: 4.7 },
  { id: 'mock-p12', name: 'Alcohol antiséptico 250ml', category: 'Farmacia', priceUsd: 1.8, priceCup: 720, stock: false, enterpriseIndex: 3, description: 'Alcohol al 70%, frasco de 250ml.' },
];

export const MOCK_PRODUCTS: Product[] = SEEDS.map((seed) => ({
  idProduct: seed.id,
  name: seed.name,
  priceCup: seed.priceCup,
  priceUsd: seed.priceUsd,
  image: null,
  description: seed.description,
  unit: 'unidad',
  stock: seed.stock,
  category: seed.category,
  userEnterpriseId: MOCK_ENTERPRISES[seed.enterpriseIndex].idUserEnterprise,
  userEnterprise: MOCK_ENTERPRISES[seed.enterpriseIndex],
}));

const RATING_BY_PRODUCT: Record<string, number> = Object.fromEntries(
  SEEDS.filter((s) => s.avgRating).map((s) => [s.id, s.avgRating as number]),
);

export function mockRatingsFor(productId: string): Rating[] {
  const avg = RATING_BY_PRODUCT[productId];
  if (!avg) return [];
  // Spread a handful of individual ratings that average out to the target.
  const base = Math.round(avg);
  const quantities = [base, base, Math.max(1, base - 1), base, Math.min(5, base + 1)];
  return quantities.map((quantity, i) => ({
    idRating: `${productId}-mock-r${i}`,
    quantity,
    userId: `mock-rater-${i}`,
    productId,
    serviceId: null,
    createdAt: new Date(Date.now() - i * 86_400_000).toISOString(),
    user: { id: `mock-rater-${i}`, username: `usuario_${i + 1}` },
  }));
}

export const MOCK_SERVICES: Service[] = [];

export function findMockEnterprise(id: string): UserEnterprise | undefined {
  return MOCK_ENTERPRISES.find((e) => e.idUserEnterprise === id);
}

export function findMockProduct(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.idProduct === id);
}
