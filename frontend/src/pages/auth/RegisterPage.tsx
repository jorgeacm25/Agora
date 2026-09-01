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
      {/* React 19 sube estas etiquetas al <head>: cada ruta con su título. */}
      <title>Crear cuenta · Agora</title>
      <meta name="description" content="Crea tu cuenta en Agora para buscar productos de las mypimes y mercados de tu ciudad, o para publicar tu catálogo." />

      <form onSubmit={handleSubmit} id="register" className="register space-y-4">
        {/* Opciones excluyentes: fieldset + legend + radios nativos, no dos
            botones con un estado pintado a mano. El radio se oculta a la vista
            pero sigue siendo el que recibe foco y teclado. */}
        <fieldset className="register__roles">
          <legend className="register__legend mb-2 text-sm font-medium text-ink-800">¿Cómo vas a usar Agora?</legend>
          <div id="register__options" className="register__options grid grid-cols-2 gap-2.5">
            <RoleOption
              icon={<ShoppingBag size={18} aria-hidden="true" />}
              label="Comprar"
              description="Buscar productos"
              value="comprador"
              checked={role === 'comprador'}
              onChange={setRole}
            />
            <RoleOption
              icon={<Store size={18} aria-hidden="true" />}
              label="Vender"
              description="Publicar catálogo"
              value="vendedor"
              checked={role === 'vendedor'}
              onChange={setRole}
            />
          </div>
        </fieldset>

        <Input
          label="Usuario"
          required
          minLength={3}
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="tu_usuario"
        />
        <Input
          label="Contraseña"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          hint="Mínimo 6 caracteres"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        <Input
          label="Confirmar contraseña"
          type="password"
          required
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
        />
        {/* role="alert" para que un lector de pantalla lo anuncie al aparecer. */}
        {error && (
          <p id="register__error" className="register__error text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
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
  value,
  checked,
  onChange,
}: {
  icon: ReactNode;
  label: string;
  description: string;
  value: Role;
  checked: boolean;
  onChange: (value: Role) => void;
}) {
  return (
    <label
      className={cn(
        'role flex cursor-pointer flex-col items-start gap-1.5 rounded-xl border px-4 py-3 text-left transition-colors',
        'has-[:focus-visible]:ring-4 has-[:focus-visible]:ring-ink-900/10',
        checked ? 'role--checked border-ink-900 bg-ink-900 text-ink-50' : 'border-ink-200 text-ink-700 hover:border-ink-400',
      )}
    >
      <input
        type="radio"
        name="role"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        id="role__input" className="role__input sr-only"
      />
      {icon}
      <span id="role__label" className="role__label text-sm font-semibold">{label}</span>
      <span className={cn('role__description text-xs', checked ? 'text-ink-50/85' : 'text-ink-500')}>{description}</span>
    </label>
  );
}
