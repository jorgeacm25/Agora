import { useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthLayout, AuthLink } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      const redirectTo = (location.state as { from?: string } | null)?.from ?? '/explorar';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      title="Bienvenido de nuevo"
      subtitle="Inicia sesión para continuar en Agora"
      footer={
        <>
          ¿No tienes cuenta? <AuthLink to="/registrarse">Crea una</AuthLink>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Usuario"
          required
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="tu_usuario"
        />
        <Input
          label="Contraseña"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Iniciar sesión
        </Button>
      </form>
    </AuthLayout>
  );
}
