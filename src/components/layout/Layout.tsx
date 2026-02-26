import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { NeuralGraph } from '../background/NeuralGraph';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col dark:bg-mtps-void bg-mtps-surface-light relative">
      <NeuralGraph />
      <Header />
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
