import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Store } from 'lucide-react';
import { AuthLayout, AuthLink } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

type Role = 'comprador' | 'vendedor';

export function RegisterPage() {
  const { register, login } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>('comprador');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    try {
      await register(username, password);
      await login(username, password);
      navigate(role === 'vendedor' ? '/vender' : '/planes', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Crea tu cuenta"
      subtitle="Elige cómo quieres usar Agora"
      footer={
        <>
          ¿Ya tienes cuenta? <AuthLink to="/iniciar-sesion">Inicia sesión</AuthLink>
        </>
      }
    >
      <div className="mb-5 grid grid-cols-2 gap-2.5">
        <RoleOption
          icon={<ShoppingBag size={18} />}
          label="Comprar"
          description="Buscar productos"
          active={role === 'comprador'}
          onClick={() => setRole('comprador')}
        />
        <RoleOption
          icon={<Store size={18} />}
          label="Vender"
          description="Publicar catálogo"
          active={role === 'vendedor'}
          onClick={() => setRole('vendedor')}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Usuario"
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="tu_usuario"
        />
        <Input
          label="Contraseña"
          type="password"
          required
          minLength={6}
          hint="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          {role === 'vendedor' ? 'Crear cuenta de vendedor' : 'Crear cuenta'}
        </Button>
      </form>
    </AuthLayout>
  );
}

function RoleOption({
  icon,
  label,
  description,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col items-start gap-1.5 rounded-xl border px-4 py-3 text-left transition-colors',
        active ? 'border-ink-900 bg-ink-900 text-white' : 'border-ink-200 text-ink-700 hover:border-ink-400',
      )}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
      <span className={cn('text-xs', active ? 'text-white/60' : 'text-ink-500')}>{description}</span>
    </button>
  );
}
