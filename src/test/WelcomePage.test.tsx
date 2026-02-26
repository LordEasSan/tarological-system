import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AppProvider } from '../context/AppContext';
import { WelcomePage } from '../pages/WelcomePage';

function renderWithProviders(ui: React.ReactElement) {
  return render(
    <ThemeProvider>
      <AppProvider>
        <MemoryRouter>{ui}</MemoryRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

describe('WelcomePage', () => {
  it('should render the main heading', () => {
    renderWithProviders(<WelcomePage />);
    expect(screen.getByText('Positivist System')).toBeInTheDocument();
  });

  it('should render feature cards', () => {
    renderWithProviders(<WelcomePage />);
    expect(screen.getByText('Configure Parameters')).toBeInTheDocument();
    expect(screen.getByText('Generate Readings')).toBeInTheDocument();
    expect(screen.getByText('Formal Verification')).toBeInTheDocument();
  });

  it('should have navigation links', () => {
    renderWithProviders(<WelcomePage />);
    expect(screen.getByText('Begin Configuration')).toBeInTheDocument();
    expect(screen.getByText('Quick Generate')).toBeInTheDocument();
  });
});
