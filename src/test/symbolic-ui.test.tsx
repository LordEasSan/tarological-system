import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '../context/ThemeContext';
import { AppProvider } from '../context/AppContext';

// Mock framer-motion to bypass AnimatePresence exit-then-enter animations
vi.mock('framer-motion', async () => {
  const actual = await vi.importActual<typeof import('framer-motion')>('framer-motion');
  return {
    ...actual,
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      ...actual.motion,
      div: ({ children, ...props }: any) => <div {...stripMotionProps(props)}>{children}</div>,
      section: ({ children, ...props }: any) => <section {...stripMotionProps(props)}>{children}</section>,
      button: ({ children, ...props }: any) => <button {...stripMotionProps(props)}>{children}</button>,
      span: ({ children, ...props }: any) => <span {...stripMotionProps(props)}>{children}</span>,
    },
  };
});

function stripMotionProps(props: Record<string, any>) {
  const stripped: Record<string, any> = {};
  for (const [key, val] of Object.entries(props)) {
    if (!['initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'variants', 'layout', 'layoutId'].includes(key)) {
      stripped[key] = val;
    }
  }
  return stripped;
}

import { ConfigurePage } from '../pages/ConfigurePage';
import { generateSymbolicNarrative, type SymbolicNarrative } from '../engine/symbolicNarrator';
import { executeUnifiedReading } from '../engine/core/unified-pipeline';
import { computeQualityScore } from '../engine/scoring';
import { mockGenerate } from '../api/mock';
import type { TarotParameters, InterrogationMode } from '../types';

/* ─── Helpers ─────────────────────────────────────── */

function renderWithProviders(ui: React.ReactElement, { route = '/' } = {}) {
  return render(
    <ThemeProvider>
      <AppProvider>
        <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
      </AppProvider>
    </ThemeProvider>
  );
}

const defaultParams: TarotParameters = {
  archetypeFamily: 'Jungian',
  deckSize: 22,
  reversalsEnabled: true,
  spreadType: 'three-card',
  drawCount: 3,
  meaningWeights: { psychological: 0.8, spiritual: 0.6, practical: 0.5, creative: 0.4, relational: 0.3 },
  narrativeStyle: 'poetic',
  seed: 42,
};

function makeReading(seed: number, mode: InterrogationMode = 'divinatory') {
  const params = { ...defaultParams, seed };
  const generateFn = () => mockGenerate(params).spread;
  return executeUnifiedReading(mode, 'What does this moment hold?', params, generateFn, {});
}

function makeNarrative(seed: number, mode: InterrogationMode = 'divinatory') {
  const response = makeReading(seed, mode);
  const qScore = computeQualityScore(response.spread, { ...defaultParams, seed });
  return { narrative: generateSymbolicNarrative(response, qScore.dimensions), response };
}

// ─── 1. Configuration Flow ──────────────────────────

describe('ConfigurePage — Reading Mode Selection', () => {
  function goToReadingModeStep() {
    renderWithProviders(<ConfigurePage />);
    // Step indicators are clickable — click "Reading Mode" step directly (step 4, index 3)
    // Text content is "4Reading Mode" (number + hidden-on-small label)
    const allButtons = screen.getAllByRole('button');
    // Find the step indicator for step 4 (Reading Mode)
    const stepBtn = allButtons.find(btn => {
      const text = btn.textContent || '';
      return text.includes('Reading Mode');
    });
    if (stepBtn) fireEvent.click(stepBtn);
  }

  it('renders both Structural and Symbolic reading mode options', () => {
    goToReadingModeStep();
    expect(screen.getByText('Structural Analysis')).toBeInTheDocument();
    expect(screen.getByText('Symbolic Reading')).toBeInTheDocument();
  });

  it('displays Italian description for symbolic mode', () => {
    goToReadingModeStep();
    expect(screen.getByText(/Narrativa simbolica completa, come farebbe un cartomante esperto/)).toBeInTheDocument();
  });

  it('saves readingMode selection — symbolic option has active ring when clicked', () => {
    goToReadingModeStep();
    const symbolicBtn = screen.getByText('Symbolic Reading').closest('button')!;
    fireEvent.click(symbolicBtn);
    expect(symbolicBtn.className).toContain('ring-2');
  });

  it('review step shows Unified Symbolic badge when symbolic selected', () => {
    goToReadingModeStep();
    // Select symbolic
    fireEvent.click(screen.getByText('Symbolic Reading').closest('button')!);
    // Navigate to review step
    const allButtons = screen.getAllByRole('button');
    const reviewBtn = allButtons.find(btn => (btn.textContent || '').includes('Review'));
    if (reviewBtn) fireEvent.click(reviewBtn);
    expect(screen.getByText(/Unified Symbolic/)).toBeInTheDocument();
  });
});

// ─── 2. Symbolic Narrative Rendering ────────────────

describe('SymbolicReadingView — Narrative Blocks', () => {
  it('generateSymbolicNarrative returns all required sections', () => {
    const { narrative } = makeNarrative(42);

    expect(narrative.opening).toBeTruthy();
    expect(narrative.cardNarratives.length).toBe(3);
    expect(narrative.synthesis).toBeTruthy();
    expect(narrative.resolution).toBeTruthy();
  });

  it('each card narrative contains the card name in bold', () => {
    const { narrative, response } = makeNarrative(42);

    response.questionNarrative.transformationSteps.forEach((step, i) => {
      const cardText = narrative.cardNarratives[i];
      expect(cardText).toContain(`**${step.cardName}**`);
    });
  });

  it('opening references the question text', () => {
    const { narrative } = makeNarrative(42);
    expect(narrative.opening).toContain('What does this moment hold');
  });

  it('synthesis references card names', () => {
    const { narrative, response } = makeNarrative(42);
    const firstCard = response.questionNarrative.transformationSteps[0].cardName;
    expect(narrative.synthesis).toContain(firstCard);
  });

  it('resolution does not contain direct advice phrases', () => {
    const advicePatterns = [
      /you should/i,
      /you must now/i,
      /you need to/i,
      /try to /i,
      /remember that/i,
    ];
    for (let seed = 1; seed <= 15; seed++) {
      const { narrative } = makeNarrative(seed);
      for (const pat of advicePatterns) {
        expect(narrative.resolution).not.toMatch(pat);
      }
    }
  });
});

// ─── 3. Badge Rendering ─────────────────────────────

describe('SymbolicReadingView — Badge Correctness', () => {
  it('IDA labels are correctly mapped', () => {
    const response = makeReading(17);
    const qn = response.questionNarrative;

    // Tension, Strategy, Resolution should all have values
    expect(qn.tensionType).toBeTruthy();
    expect(qn.completionStrategy).toBeTruthy();
    expect(qn.resolutionArchetype).toBeTruthy();
    expect(qn.transformationMode).toBeTruthy();
  });

  it('each card step has a valid role', () => {
    const validRoles = ['anchor', 'catalyst', 'shadow', 'bridge'];
    for (let seed = 1; seed <= 10; seed++) {
      const response = makeReading(seed);
      for (const step of response.questionNarrative.transformationSteps) {
        expect(validRoles).toContain(step.role);
      }
    }
  });
});

// ─── 4. Mobile Responsiveness ───────────────────────

describe('SymbolicReadingView — Responsive Classes', () => {
  /*
   * We verify that the component source uses responsive breakpoint prefixes
   * (sm:, lg:) so the layout adapts on mobile. This is a structural check
   * since jsdom doesn't simulate viewport widths.
   */
  it('SymbolicReadingView uses responsive text sizing (sm: prefix)', async () => {
    // Read the source to verify responsive classes are present
    const fs = await import('fs');
    const src = fs.readFileSync(
      'src/pages/UnifiedReadingPage.tsx',
      'utf-8'
    );
    // Card text uses sm: responsive sizing
    expect(src).toContain('sm:text-[15px]');
    expect(src).toContain('text-[14px]');
    // Spacing uses sm: responsive
    expect(src).toContain('sm:space-y-10');
    // Padding uses sm: responsive
    expect(src).toContain('sm:px-6');
    expect(src).toContain('sm:pl-12');
  });

  it('structural derivation grid stacks on mobile (grid-cols-2 sm:grid-cols-4)', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync(
      'src/pages/UnifiedReadingPage.tsx',
      'utf-8'
    );
    expect(src).toContain('grid-cols-2 sm:grid-cols-4');
  });

  it('card blocks use responsive padding (p-4 sm:p-6)', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync(
      'src/pages/UnifiedReadingPage.tsx',
      'utf-8'
    );
    expect(src).toContain('p-4 sm:p-6');
  });
});

// ─── 5. Night Mode ──────────────────────────────────

describe('SymbolicReadingView — Night Mode Classes', () => {
  it('uses dark: prefix for text colors across all sections', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync(
      'src/pages/UnifiedReadingPage.tsx',
      'utf-8'
    );
    // Opening text
    expect(src).toContain('dark:text-mtps-silver/90');
    // Card narrative text
    expect(src).toContain('dark:text-mtps-silver/85');
    // Synthesis border
    expect(src).toContain('dark:border-mtps-accent/20');
    // Resolution border
    expect(src).toContain('dark:border-mtps-gold/30');
    // Badge dark variants
    expect(src).toContain('dark:bg-rose-500/15');
    expect(src).toContain('dark:bg-cyan-500/15');
    expect(src).toContain('dark:bg-violet-500/15');
    // Structural derivation dark background
    expect(src).toContain('dark:bg-mtps-deep/20');
  });

  it('card blocks have dark mode background', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync(
      'src/pages/UnifiedReadingPage.tsx',
      'utf-8'
    );
    expect(src).toContain('dark:bg-mtps-deep/30');
    expect(src).toContain('dark:border-mtps-border/30');
  });

  it('italic emphasis uses gold tint in dark mode', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync(
      'src/pages/UnifiedReadingPage.tsx',
      'utf-8'
    );
    // The renderNarrative function wraps *italic* with a gold-tinted class
    expect(src).toContain('dark:text-mtps-gold/80');
  });
});

// ─── 6. Determinism ─────────────────────────────────

describe('SymbolicReadingView — Determinism', () => {
  it('same seed + mode produces identical narratives', () => {
    const { narrative: n1 } = makeNarrative(99);
    const { narrative: n2 } = makeNarrative(99);

    expect(n1.opening).toBe(n2.opening);
    expect(n1.synthesis).toBe(n2.synthesis);
    expect(n1.resolution).toBe(n2.resolution);
    n1.cardNarratives.forEach((c, i) => {
      expect(c).toBe(n2.cardNarratives[i]);
    });
  });

  it('different seeds produce different narratives', () => {
    const { narrative: n1 } = makeNarrative(1);
    const { narrative: n2 } = makeNarrative(2);

    // At least opening or resolution should differ
    const differ = n1.opening !== n2.opening || n1.resolution !== n2.resolution;
    expect(differ).toBe(true);
  });

  it('different modes on same seed produce different openings', () => {
    const { narrative: nDiv } = makeNarrative(42, 'divinatory');
    const { narrative: nPhi } = makeNarrative(42, 'philosophical');

    expect(nDiv.opening).not.toBe(nPhi.opening);
  });
});

// ─── 7. Narrative Quality Constraints ───────────────

describe('SymbolicReadingView — Narrative Quality', () => {
  it('no banned phrases across 15 seeds', () => {
    const banned = [
      'the universe tells you', 'trust the process',
      'everything happens for a reason', 'the cards never lie',
      'your destiny awaits', 'cosmic energy flows',
      'the universe', 'energy around you',
      'this card represents', 'you should', 'your path',
    ];
    for (let seed = 1; seed <= 15; seed++) {
      const { narrative: n } = makeNarrative(seed);
      const full = [n.opening, ...n.cardNarratives, n.synthesis, n.resolution].join(' ').toLowerCase();
      for (const phrase of banned) {
        expect(full).not.toContain(phrase.toLowerCase());
      }
    }
  });

  it('card narratives use multi-line rhythm (not monolithic)', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const { narrative: n } = makeNarrative(seed);
      for (const card of n.cardNarratives) {
        const lines = card.split('\n').filter(l => l.trim().length > 0);
        expect(lines.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('opening is multi-line', () => {
    for (let seed = 1; seed <= 5; seed++) {
      const { narrative: n } = makeNarrative(seed);
      const lines = n.opening.split('\n').filter(l => l.trim().length > 0);
      expect(lines.length).toBeGreaterThanOrEqual(3);
    }
  });
});
// ─── 8. Direct Insight in Narrative ─────────────────

describe('SymbolicReadingView — Direct Insight', () => {
  it('generateSymbolicNarrative returns directInsight field', () => {
    const { narrative } = makeNarrative(42);
    expect(narrative).toHaveProperty('directInsight');
    expect(typeof narrative.directInsight).toBe('string');
    expect(narrative.directInsight.length).toBeGreaterThan(20);
  });

  it('directInsight references anchor card name', () => {
    const { narrative, response } = makeNarrative(42);
    const steps = response.questionNarrative.transformationSteps;
    const anchorStep = steps.find(s => s.role === 'anchor') ?? steps[0];
    expect(narrative.directInsight).toContain(anchorStep.cardName);
  });

  it('directInsight is deterministic for same seed', () => {
    const { narrative: n1 } = makeNarrative(42);
    const { narrative: n2 } = makeNarrative(42);
    expect(n1.directInsight).toBe(n2.directInsight);
  });
});

// ─── 9. Config Summary Bar (source check) ──────────

describe('SymbolicReadingView — Config Summary Bar', () => {
  it('source contains config-summary-bar test id', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('data-testid="config-summary-bar"');
  });

  it('config summary bar shows θ parameter labels', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('archetypeFamily');
    expect(src).toContain('deckSize');
    expect(src).toContain('spreadType');
    expect(src).toContain('narrativeStyle');
    expect(src).toContain('reversalsEnabled');
  });

  it('Reconfigure button navigates to /configure', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain("navigate('/configure')");
    expect(src).toContain('Reconfigure');
  });
});

// ─── 10. Language Selector (source check) ───────────

describe('SymbolicReadingView — Language Selector', () => {
  it('source contains language-selector test id', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('data-testid="language-selector"');
  });

  it('language selector has EN and IT toggle buttons', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    // EN and IT buttons with click handlers
    expect(src).toContain("setNarrativeLanguage('en')");
    expect(src).toContain("setNarrativeLanguage('it')");
    expect(src).toContain('EN');
    expect(src).toContain('IT');
  });

  it('language selector uses Globe icon', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('Globe');
  });

  it('narrativeLanguage is passed to generateSymbolicNarrative', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('narrativeLanguage');
    // generateSymbolicNarrative receives narrativeLanguage parameter
    expect(src).toContain('generateSymbolicNarrative(result');
    expect(src).toContain('narrativeLanguage)');
  });
});

// ─── 11. Direct Insight Section (source check) ─────

describe('SymbolicReadingView — Direct Insight Section', () => {
  it('source contains direct-insight test id', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('data-testid="direct-insight"');
  });

  it('direct insight section uses emerald color scheme', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('dark:border-emerald-500/30');
    expect(src).toContain('dark:bg-emerald-500/5');
  });

  it('direct insight section renders narrative.directInsight', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('narrative.directInsight');
  });
});

// ─── 12. JSX Structure Regression Tests ─────────────

describe('UnifiedReadingPage — JSX Structure Integrity', () => {
  /**
   * These tests prevent regressions from corrupted merge/replace operations
   * that previously introduced broken JSX tags like `<div:bg-mtps-...>` or
   * misplaced closing tags.
   */

  let src: string;
  beforeAll(async () => {
    const fs = await import('fs');
    src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
  });

  it('contains no corrupted tag patterns (<div: or </div:)', () => {
    expect(src).not.toMatch(/<div:/);
    expect(src).not.toMatch(/<\/div:/);
  });

  it('contains no stray ">6" corruption artifact', () => {
    expect(src).not.toContain('">6"');
    expect(src).not.toContain('">6');
  });

  it('motion.div open/close tags are balanced', () => {
    const opens = (src.match(/<motion\.div[\s>]/g) || []).length;
    const selfClosing = (src.match(/<motion\.div[^>]*\/>/g) || []).length;
    const closes = (src.match(/<\/motion\.div>/g) || []).length;
    expect(opens - selfClosing).toBe(closes);
  });

  it('header section uses motion.div with reading-header testid', () => {
    expect(src).toContain('data-testid="reading-header"');
    const headerMatch = src.match(/data-testid="reading-header"/);
    expect(headerMatch).toBeTruthy();
  });

  it('config-summary-bar appears before symbolic-reading-view', () => {
    const summaryPos = src.indexOf('data-testid="config-summary-bar"');
    const symbolicViewPos = src.indexOf('data-testid="symbolic-reading-view"');
    expect(summaryPos).toBeGreaterThan(-1);
    expect(symbolicViewPos).toBeGreaterThan(-1);
    expect(summaryPos).toBeLessThan(symbolicViewPos);
  });

  it('direct-insight appears after Resolution and before structural-derivation', () => {
    const resolutionHeader = src.indexOf('─── Resolution ───');
    const directInsight = src.indexOf('data-testid="direct-insight"');
    const structuralDerivation = src.indexOf('data-testid="structural-derivation"');
    expect(resolutionHeader).toBeGreaterThan(-1);
    expect(directInsight).toBeGreaterThan(resolutionHeader);
    expect(directInsight).toBeLessThan(structuralDerivation);
  });

  it('direct-insight is NOT nested inside card-badges div', () => {
    const allCardBadgesPositions = [...src.matchAll(/data-testid="card-badges-\d+"/g)].map(m => m.index!);
    const directInsightPos = src.indexOf('data-testid="direct-insight"');
    for (const badgePos of allCardBadgesPositions) {
      expect(badgePos).toBeLessThan(directInsightPos);
    }
  });

  it('language-selector is inside config-summary-bar block', () => {
    const configBarPos = src.indexOf('data-testid="config-summary-bar"');
    const langSelectorPos = src.indexOf('data-testid="language-selector"');
    const configBarClosingPos = src.indexOf('</motion.div>', configBarPos);
    expect(langSelectorPos).toBeGreaterThan(configBarPos);
    expect(langSelectorPos).toBeLessThan(configBarClosingPos);
  });

  it('no duplicate direct-insight sections exist', () => {
    const matches = src.match(/data-testid="direct-insight"/g) || [];
    expect(matches.length).toBe(1);
  });

  it('no duplicate config-summary-bar sections exist', () => {
    const matches = src.match(/data-testid="config-summary-bar"/g) || [];
    expect(matches.length).toBe(1);
  });

  it('no duplicate language-selector sections exist', () => {
    const matches = src.match(/data-testid="language-selector"/g) || [];
    expect(matches.length).toBe(1);
  });
});

// ─── 13. Rendered Component — Config Summary Bar ────

import { UnifiedReadingPage } from '../pages/UnifiedReadingPage';

describe('UnifiedReadingPage — Rendered Config Summary Bar', () => {
  it('renders config-summary-bar with θ label', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const summaryBar = screen.getByTestId('config-summary-bar');
    expect(summaryBar).toBeInTheDocument();
    expect(summaryBar.textContent).toContain('θ');
  });

  it('config summary bar contains parameter pills', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const summaryBar = screen.getByTestId('config-summary-bar');
    expect(summaryBar.textContent).toContain('cards');
  });

  it('renders Reconfigure and Home buttons', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    expect(screen.getByText(/Reconfigure/)).toBeInTheDocument();
    expect(screen.getByText(/Home/)).toBeInTheDocument();
  });
});

// ─── 14. Rendered Component — Language Selector ─────

describe('UnifiedReadingPage — Rendered Language Selector', () => {
  it('renders language-selector with EN and IT buttons', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const langSelector = screen.getByTestId('language-selector');
    expect(langSelector).toBeInTheDocument();
    expect(langSelector.textContent).toContain('EN');
    expect(langSelector.textContent).toContain('IT');
  });

  it('EN button is active by default (has accent class)', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const langSelector = screen.getByTestId('language-selector');
    const buttons = langSelector.querySelectorAll('button');
    const enBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'EN')!;
    expect(enBtn.className).toContain('mtps-accent');
  });

  it('clicking IT toggles language without crashing', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const langSelector = screen.getByTestId('language-selector');
    const buttons = langSelector.querySelectorAll('button');
    const itBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'IT')!;
    expect(() => fireEvent.click(itBtn)).not.toThrow();
  });

  it('clicking IT makes IT button active', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const langSelector = screen.getByTestId('language-selector');
    const buttons = langSelector.querySelectorAll('button');
    const itBtn = Array.from(buttons).find(b => b.textContent?.trim() === 'IT')!;
    fireEvent.click(itBtn);
    expect(itBtn.className).toContain('mtps-accent');
  });
});

// ─── 15. Rendered Component — Reading Header ────────

describe('UnifiedReadingPage — Rendered Header', () => {
  it('renders reading-header with title', () => {
    renderWithProviders(<UnifiedReadingPage />, { route: '/reading' });
    const header = screen.getByTestId('reading-header');
    expect(header).toBeInTheDocument();
    expect(header.textContent).toContain('Unified Symbolic Reading');
  });

  it('header uses responsive sm: layout classes', async () => {
    const fs = await import('fs');
    const src = fs.readFileSync('src/pages/UnifiedReadingPage.tsx', 'utf-8');
    expect(src).toContain('sm:flex-row');
    expect(src).toContain('sm:items-center');
  });
});