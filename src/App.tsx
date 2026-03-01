import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { TutorialProvider } from './context/TutorialContext';
import { TokenProvider } from './context/TokenContext';
import { Layout } from './components/layout';
import { TourOverlay } from './components/tutorial';
import { TokenSync } from './components/token';
import { WelcomePage } from './pages';

// Lazy-load heavy pages — keeps initial bundle small
const ConfigurePage = lazy(() => import('./pages/ConfigurePage').then(m => ({ default: m.ConfigurePage })));
const GeneratePage = lazy(() => import('./pages/GeneratePage').then(m => ({ default: m.GeneratePage })));
const VerifyPage = lazy(() => import('./pages/VerifyPage').then(m => ({ default: m.VerifyPage })));
const PhilosophicalPage = lazy(() => import('./pages/PhilosophicalPage').then(m => ({ default: m.PhilosophicalPage })));
const CosmologicalPage = lazy(() => import('./pages/CosmologicalPage').then(m => ({ default: m.CosmologicalPage })));
const UnifiedReadingPage = lazy(() => import('./pages/UnifiedReadingPage').then(m => ({ default: m.UnifiedReadingPage })));

function LazyFallback() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="w-6 h-6 border-2 border-t-transparent dark:border-mtps-accent border-mtps-purple rounded-full animate-spin" />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <TokenProvider>
          <TokenSync />
          <BrowserRouter basename="/tarological-system">
            <TutorialProvider>
              <Suspense fallback={<LazyFallback />}>
                <Routes>
                  <Route element={<Layout />}>
                    <Route path="/" element={<WelcomePage />} />
                    <Route path="/configure" element={<ConfigurePage />} />
                    <Route path="/generate" element={<GeneratePage />} />
                    <Route path="/verify" element={<VerifyPage />} />
                    <Route path="/philosophical" element={<PhilosophicalPage />} />
                    <Route path="/cosmological" element={<CosmologicalPage />} />
                    <Route path="/reading" element={<UnifiedReadingPage />} />
                  </Route>
                </Routes>
              </Suspense>
              <TourOverlay />
            </TutorialProvider>
          </BrowserRouter>
        </TokenProvider>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
