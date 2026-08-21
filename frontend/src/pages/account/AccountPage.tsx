import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { updatePassword, deleteAccount } from '@/api/user';
import { Input } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Card, Badge } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { initials } from '@/lib/utils';

export function AccountPage() {
  const { user, isSeller, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  async function handlePasswordChange(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await updatePassword(currentPassword, newPassword);
      notify('Contraseña actualizada');
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo actualizar la contraseña', 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!user) return;
    setDeleting(true);
    try {
      await deleteAccount(user.id);
      notify('Cuenta eliminada');
      logout();
      navigate('/');
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo eliminar la cuenta', 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink-900 text-lg font-semibold text-white">
          {initials(user.username)}
        </span>
        <div>
          <h1 className="text-xl font-semibold text-ink-900">{user.username}</h1>
          <Badge variant={isSeller ? 'dark' : 'neutral'} className="mt-1">
            {isSeller ? 'Cuenta de vendedor' : 'Cuenta de comprador'}
          </Badge>
        </div>
      </div>

      <Card className="p-6">
        <h2 className="mb-4 font-semibold text-ink-900">Cambiar contraseña</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <Input
            label="Contraseña actual"
            type="password"
            required
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <Input
            label="Nueva contraseña"
            type="password"
            required
            minLength={6}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button type="submit" loading={submitting}>Actualizar contraseña</Button>
        </form>
      </Card>

      <Card className="p-6 border-red-100">
        <h2 className="mb-1.5 font-semibold text-ink-900">Eliminar cuenta</h2>
        <p className="mb-4 text-sm text-ink-500">Esta acción es permanente y no se puede deshacer.</p>
        <Button variant="danger" icon={<Trash2 size={15} />} onClick={() => setConfirmDelete(true)}>
          Eliminar mi cuenta
        </Button>
      </Card>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar cuenta"
        description="Se eliminará tu cuenta de forma permanente. ¿Deseas continuar?"
        confirmLabel="Eliminar cuenta"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}
