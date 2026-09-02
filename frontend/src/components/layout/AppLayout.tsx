import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { NewNotificationsToast } from '@/components/notifications/NewNotificationsToast';
import { Footer } from './Footer';

export function AppLayout() {
  return (
    <div id="app" className="app flex min-h-screen flex-col">
      <Navbar />
      {/* Sobre el carrusel, no dentro: el aviso pertenece a la sesión. */}
      <NewNotificationsToast />
      <main id="app__main" className="app__main flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
