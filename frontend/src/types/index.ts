export interface AuthUser {
  id: string;
  username: string;
  permissions: string[];
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: string;
  user: AuthUser;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Contact {
  email: string;
  phone: string;
  website?: string;
}

export interface UserEnterprise {
  idUserEnterprise: string;
  userId: string;
  companyName: string;
  address: Address | null;
  contact: Contact | null;
  officeHours: string | null;
  code: number | null;
  latitude: number | null;
  longitude: number | null;
}

export interface Product {
  idProduct: string;
  name: string;
  priceCup: number | null;
  priceUsd: number | null;
  image: string | null;
  description: string;
  unit: string;
  stock: boolean;
  category: string;
  userEnterpriseId: string;
  userEnterprise?: UserEnterprise;
}

export interface Service {
  idService: string;
  name: string;
  priceCup: number | null;
  priceUsd: number | null;
  description: string;
  userEnterpriseId: string;
  userEnterprise?: UserEnterprise;
}

export interface Rating {
  idRating: string;
  quantity: number;
  userId: string;
  productId: string | null;
  serviceId: string | null;
  createdAt: string;
  user?: { id: string; username: string };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

export interface Paginated<T> {
  products: T[];
  total: number;
}
