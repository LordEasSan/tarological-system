import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { NeuralGraph } from '../background/NeuralGraph';
import { TokenBanner, TokenModal } from '../token';
import { useToken } from '../../context/TokenContext';

export function Layout() {
  const { isTokenValid } = useToken();
  const [tokenModalOpen, setTokenModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col dark:bg-mtps-void bg-mtps-surface-light relative">
      <NeuralGraph />
      <Header onOpenTokenModal={() => setTokenModalOpen(true)} />
      {!isTokenValid && <TokenBanner onOpenModal={() => setTokenModalOpen(true)} />}
      <main className="flex-1 relative z-10">
        <Outlet />
      </main>
      <Footer />
      <TokenModal open={tokenModalOpen} onOpenChange={setTokenModalOpen} />
    </div>
  );
}
