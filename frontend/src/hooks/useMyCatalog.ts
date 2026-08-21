import { useCallback, useEffect, useState } from 'react';
import { listProducts } from '@/api/product';
import { listServicesByEnterprise } from '@/api/service';
import type { Product, Service } from '@/types';
import { useAuth } from '@/context/AuthContext';

export function useMyProducts() {
  const { enterprise } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!enterprise) {
      setProducts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await listProducts({ limit: 100 });
      setProducts(data.products.filter((p) => p.userEnterpriseId === enterprise.idUserEnterprise));
    } finally {
      setIsLoading(false);
    }
  }, [enterprise]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { products, isLoading, reload };
}

export function useMyServices() {
  const { enterprise } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    if (!enterprise) {
      setServices([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await listServicesByEnterprise(enterprise.idUserEnterprise);
      setServices(data);
    } finally {
      setIsLoading(false);
    }
  }, [enterprise]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { services, isLoading, reload };
}
