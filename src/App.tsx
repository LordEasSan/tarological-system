import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { TutorialProvider } from './context/TutorialContext';
import { Layout } from './components/layout';
import { TourOverlay } from './components/tutorial';
import { WelcomePage, ConfigurePage, GeneratePage, VerifyPage } from './pages';

function App() {
  return (
    <ThemeProvider>
      <AppProvider>
        <BrowserRouter basename="/tarological-system">
          <TutorialProvider>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<WelcomePage />} />
                <Route path="/configure" element={<ConfigurePage />} />
                <Route path="/generate" element={<GeneratePage />} />
                <Route path="/verify" element={<VerifyPage />} />
              </Route>
            </Routes>
            <TourOverlay />
          </TutorialProvider>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;
