import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AppProvider } from '../context/AppContext';
import { TutorialProvider, useTutorial, TOUR_STEPS } from '../context/TutorialContext';
import { TourOverlay } from '../components/tutorial/TourOverlay';
import { InfoTooltip } from '../components/tutorial/InfoTooltip';

/* ─── Helpers ─────────────────────────────────────── */

function TestConsumer() {
  const { state, steps, currentStep, totalSteps, startTour, startPageTour, next, prev, skip, resetTutorial } = useTutorial();
  return (
    <div>
      <span data-testid="is-active">{String(state.isActive)}</span>
      <span data-testid="step-index">{state.currentStepIndex}</span>
      <span data-testid="total-steps">{totalSteps}</span>
      <span data-testid="has-completed">{String(state.hasCompletedTour)}</span>
      <span data-testid="current-step-id">{currentStep?.id ?? 'none'}</span>
      <span data-testid="steps-count">{steps.length}</span>
      <button data-testid="start-all" onClick={() => startTour(null)}>Start All</button>
      <button data-testid="start-page" onClick={startPageTour}>Start Page</button>
      <button data-testid="next" onClick={next}>Next</button>
      <button data-testid="prev" onClick={prev}>Prev</button>
      <button data-testid="skip" onClick={skip}>Skip</button>
      <button data-testid="reset" onClick={resetTutorial}>Reset</button>
    </div>
  );
}

function renderWithTutorial(
  ui: React.ReactElement,
  { route = '/' }: { route?: string } = {}
) {
  // Note: Do NOT clear localStorage here — individual tests manage their own state.
  // The beforeEach() block handles cleanup.

  return render(
    <ThemeProvider>
      <AppProvider>
        <MemoryRouter initialEntries={[route]}>
          <TutorialProvider>{ui}</TutorialProvider>
        </MemoryRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

beforeEach(() => {
  localStorage.removeItem('mtps-tutorial');
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
  localStorage.removeItem('mtps-tutorial');
});

/* ─── Tour Step Definitions ───────────────────────── */

describe('TOUR_STEPS', () => {
  it('should have steps for all 4 routes', () => {
    const routes = new Set(TOUR_STEPS.map((s) => s.route));
    expect(routes).toContain('/');
    expect(routes).toContain('/configure');
    expect(routes).toContain('/generate');
    expect(routes).toContain('/verify');
  });

  it('should have unique IDs', () => {
    const ids = TOUR_STEPS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('should have at least 2 steps per route', () => {
    const routes = ['/', '/configure', '/generate', '/verify'];
    for (const route of routes) {
      const count = TOUR_STEPS.filter((s) => s.route === route).length;
      expect(count).toBeGreaterThanOrEqual(2);
    }
  });

  it('should always have a target and content', () => {
    for (const step of TOUR_STEPS) {
      expect(step.target).toBeTruthy();
      expect(step.content.length).toBeGreaterThan(10);
      expect(step.title.length).toBeGreaterThan(2);
    }
  });
});

/* ─── TutorialProvider / useTutorial ──────────────── */

describe('TutorialProvider', () => {
  it('should auto-start on first visit after delay', async () => {
    renderWithTutorial(<TestConsumer />);

    // Initially not active until the auto-start timer fires
    // The auto-start has a 1200ms delay
    expect(screen.getByTestId('is-active').textContent).toBe('false');

    act(() => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.getByTestId('is-active').textContent).toBe('true');
  });

  it('should not auto-start if tour was completed', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true, currentStepIndex: 0 }));

    renderWithTutorial(<TestConsumer />);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByTestId('is-active').textContent).toBe('false');
  });

  it('should filter steps for the current route', () => {
    renderWithTutorial(<TestConsumer />, { route: '/' });

    const welcomeSteps = TOUR_STEPS.filter((s) => s.route === '/');
    expect(screen.getByTestId('steps-count').textContent).toBe(String(welcomeSteps.length));
  });

  it('should support manual startTour()', () => {
    // Pre-mark as completed so auto-start doesn't fire
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);

    fireEvent.click(screen.getByTestId('start-all'));

    expect(screen.getByTestId('is-active').textContent).toBe('true');
    expect(screen.getByTestId('step-index').textContent).toBe('0');
  });

  it('should advance with next()', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);
    fireEvent.click(screen.getByTestId('start-all'));

    fireEvent.click(screen.getByTestId('next'));
    expect(screen.getByTestId('step-index').textContent).toBe('1');
  });

  it('should go back with prev()', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);
    fireEvent.click(screen.getByTestId('start-all'));
    fireEvent.click(screen.getByTestId('next'));
    fireEvent.click(screen.getByTestId('prev'));

    expect(screen.getByTestId('step-index').textContent).toBe('0');
  });

  it('should not go below step 0', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);
    fireEvent.click(screen.getByTestId('start-all'));
    fireEvent.click(screen.getByTestId('prev'));

    expect(screen.getByTestId('step-index').textContent).toBe('0');
  });

  it('should finish when next() is called on the last step', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />, { route: '/' });
    fireEvent.click(screen.getByTestId('start-page'));

    const welcomeSteps = TOUR_STEPS.filter((s) => s.route === '/');
    for (let i = 0; i < welcomeSteps.length; i++) {
      fireEvent.click(screen.getByTestId('next'));
    }

    expect(screen.getByTestId('is-active').textContent).toBe('false');
    expect(screen.getByTestId('has-completed').textContent).toBe('true');
  });

  it('should mark hasCompletedTour on finish', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />, { route: '/' });
    fireEvent.click(screen.getByTestId('start-page'));

    const welcomeSteps = TOUR_STEPS.filter((s) => s.route === '/');
    for (let i = 0; i < welcomeSteps.length; i++) {
      fireEvent.click(screen.getByTestId('next'));
    }

    // Check localStorage
    const stored = JSON.parse(localStorage.getItem('mtps-tutorial') ?? '{}');
    expect(stored.hasCompletedTour).toBe(true);
  });

  it('should deactivate on skip()', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);
    fireEvent.click(screen.getByTestId('start-all'));
    expect(screen.getByTestId('is-active').textContent).toBe('true');

    fireEvent.click(screen.getByTestId('skip'));
    expect(screen.getByTestId('is-active').textContent).toBe('false');
  });

  it('should resetTutorial() clearing hasCompletedTour', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);
    expect(screen.getByTestId('has-completed').textContent).toBe('true');

    fireEvent.click(screen.getByTestId('reset'));
    expect(screen.getByTestId('has-completed').textContent).toBe('false');
  });

  it('should persist state to localStorage', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />);
    fireEvent.click(screen.getByTestId('start-all'));
    fireEvent.click(screen.getByTestId('next'));

    const stored = JSON.parse(localStorage.getItem('mtps-tutorial') ?? '{}');
    expect(stored.currentStepIndex).toBe(1);
  });

  it('should return currentStep matching the step index', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />, { route: '/' });
    fireEvent.click(screen.getByTestId('start-page'));

    const welcomeSteps = TOUR_STEPS.filter((s) => s.route === '/');
    expect(screen.getByTestId('current-step-id').textContent).toBe(welcomeSteps[0].id);

    fireEvent.click(screen.getByTestId('next'));
    expect(screen.getByTestId('current-step-id').textContent).toBe(welcomeSteps[1].id);
  });

  it('should startPageTour() using current route', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<TestConsumer />, { route: '/verify' });
    fireEvent.click(screen.getByTestId('start-page'));

    const verifySteps = TOUR_STEPS.filter((s) => s.route === '/verify');
    expect(screen.getByTestId('total-steps').textContent).toBe(String(verifySteps.length));
    expect(screen.getByTestId('is-active').textContent).toBe('true');
  });
});

/* ─── InfoTooltip ─────────────────────────────────── */

describe('InfoTooltip', () => {
  it('should render the trigger icon', () => {
    renderWithTutorial(<InfoTooltip text="Test tooltip" />);
    expect(screen.getByTestId('info-tooltip-trigger')).toBeInTheDocument();
  });

  it('should not show tooltip initially', () => {
    renderWithTutorial(<InfoTooltip text="Test tooltip" />);
    expect(screen.queryByTestId('info-tooltip-content')).not.toBeInTheDocument();
  });

  it('should show tooltip on hover', async () => {
    renderWithTutorial(<InfoTooltip text="Helpful info here" />);

    fireEvent.mouseEnter(screen.getByTestId('info-tooltip-trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('info-tooltip-content')).toBeInTheDocument();
    });
    expect(screen.getByText('Helpful info here')).toBeInTheDocument();
  });

  it('should hide tooltip on mouse leave', async () => {
    renderWithTutorial(<InfoTooltip text="Helpful info" />);

    fireEvent.mouseEnter(screen.getByTestId('info-tooltip-trigger'));
    await waitFor(() => {
      expect(screen.getByTestId('info-tooltip-content')).toBeInTheDocument();
    });

    fireEvent.mouseLeave(screen.getByTestId('info-tooltip-trigger'));

    // Wait for the 120ms hide timer + animation
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // The tooltip should eventually disappear (framer-motion AnimatePresence)
    // With fake timers, the exit animation may be tricky — verify the state
    // triggers by checking the trigger no longer has aria-describedby
    await waitFor(() => {
      const trigger = screen.getByTestId('info-tooltip-trigger');
      expect(trigger).not.toHaveAttribute('aria-describedby');
    }, { timeout: 2000 });
  });

  it('should show tooltip on focus (keyboard accessibility)', async () => {
    renderWithTutorial(<InfoTooltip text="Keyboard tooltip" />);

    fireEvent.focus(screen.getByTestId('info-tooltip-trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('info-tooltip-content')).toBeInTheDocument();
    });
    expect(screen.getByText('Keyboard tooltip')).toBeInTheDocument();
  });

  it('should have role="tooltip" attribute', async () => {
    renderWithTutorial(<InfoTooltip text="ARIA tooltip" />);

    fireEvent.mouseEnter(screen.getByTestId('info-tooltip-trigger'));

    await waitFor(() => {
      const tooltip = screen.getByTestId('info-tooltip-content');
      expect(tooltip).toHaveAttribute('role', 'tooltip');
    });
  });

  it('should set aria-describedby on trigger when visible', async () => {
    renderWithTutorial(<InfoTooltip text="Described tooltip" />);

    const trigger = screen.getByTestId('info-tooltip-trigger');
    expect(trigger).not.toHaveAttribute('aria-describedby');

    fireEvent.mouseEnter(trigger);

    await waitFor(() => {
      expect(trigger).toHaveAttribute('aria-describedby');
    });
  });

  it('should support custom placement prop', async () => {
    renderWithTutorial(<InfoTooltip text="Bottom tooltip" placement="bottom" />);

    fireEvent.mouseEnter(screen.getByTestId('info-tooltip-trigger'));

    await waitFor(() => {
      expect(screen.getByTestId('info-tooltip-content')).toBeInTheDocument();
    });
  });

  it('should render custom trigger children', () => {
    renderWithTutorial(
      <InfoTooltip text="Custom trigger">
        <span data-testid="custom-child">?</span>
      </InfoTooltip>
    );
    expect(screen.getByTestId('custom-child')).toBeInTheDocument();
  });
});

/* ─── TourOverlay ─────────────────────────────────── */

describe('TourOverlay', () => {
  function OverlayTest() {
    const { startTour, state } = useTutorial();
    return (
      <div>
        <div id="tour-welcome-hero">Hero element</div>
        <button data-testid="start" onClick={() => startTour('/')}>Start</button>
        <span data-testid="active">{String(state.isActive)}</span>
        <TourOverlay />
      </div>
    );
  }

  it('should not render when tour is inactive', () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<OverlayTest />);

    expect(screen.queryByTestId('tour-overlay')).not.toBeInTheDocument();
  });

  it('should render overlay when tour is active', async () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<OverlayTest />);
    fireEvent.click(screen.getByTestId('start'));

    // Wait for the 100ms measurement delay
    act(() => {
      vi.advanceTimersByTime(200);
    });

    await waitFor(() => {
      expect(screen.getByTestId('tour-overlay')).toBeInTheDocument();
    });
  });

  it('should render the TourStep dialog when target exists', async () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<OverlayTest />);
    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByTestId('tour-step')).toBeInTheDocument();
    });
  });

  it('should show step title and content', async () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<OverlayTest />);
    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const step = TOUR_STEPS.find((s) => s.id === 'welcome-hero')!;
    await waitFor(() => {
      expect(screen.getByText(step.title)).toBeInTheDocument();
      expect(screen.getByText(step.content)).toBeInTheDocument();
    });
  });

  it('should show navigation buttons', async () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<OverlayTest />);
    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByTestId('tour-next')).toBeInTheDocument();
      expect(screen.getByTestId('tour-skip')).toBeInTheDocument();
      expect(screen.getByTestId('tour-close')).toBeInTheDocument();
    });
  });

  it('should advance to next step on Next click', async () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(
      <div>
        <div id="tour-welcome-hero">Hero</div>
        <div id="tour-welcome-begin">Begin</div>
        <div id="tour-welcome-features">Features</div>
        <OverlayTest />
      </div>
    );
    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByTestId('tour-next')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tour-next'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    const step2 = TOUR_STEPS.filter((s) => s.route === '/')[1];
    await waitFor(() => {
      expect(screen.getByText(step2.title)).toBeInTheDocument();
    });
  });

  it('should close on skip', async () => {
    localStorage.setItem('mtps-tutorial', JSON.stringify({ hasCompletedTour: true }));

    renderWithTutorial(<OverlayTest />);
    fireEvent.click(screen.getByTestId('start'));

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await waitFor(() => {
      expect(screen.getByTestId('tour-skip')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId('tour-skip'));

    expect(screen.getByTestId('active').textContent).toBe('false');
  });
});
