# MTPS Architecture Overview

## System Diagram

```
┌──────────────────────────────────────────────────────────┐
│                        Frontend                          │
│    React 19 + TypeScript + Vite 7 + Tailwind CSS 4       │
│    Cyber/Hacker aesthetic · Bio-canvas neural graph       │
│                                                          │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Welcome │ │Configure │ │ Generate │ │    Verify     │ │
│  │  Page   │ │ 4-Step   │ │Dashboard │ │  LTL + D1-D6 │ │
│  └─────────┘ └──────────┘ └──────────┘ └──────────────┘ │
│       │            │            │            │           │
│  ┌───────────────────────────────────────────────────┐   │
│  │          Modular Engine (src/engine/)              │   │
│  │  archetypes · spreads · narrative · ltl            │   │
│  │  meaning · scoring (D1-D6) · iteration            │   │
│  └───────────────────────────────────────────────────┘   │
│       │            │            │            │           │
│  ┌───────────────────────────────────────────────────┐   │
│  │     React Context (AppState, Theme) + Debug       │   │
│  └───────────────────────────────────────────────────┘   │
│       │            │            │            │           │
│  ┌───────────────────────────────────────────────────┐   │
│  │   API Client (fetch) + GitHub LLM placeholder     │   │
│  └───────────────────────────────────────────────────┘   │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS
                       ▼
┌──────────────────────────────────────────────────────────┐
│              Cloudflare Workers (Edge)                    │
│                                                          │
│  POST /api/generate   → Deck generation                  │
│  POST /api/verify     → LTL model checking               │
│  GET  /api/archetypes → Archetype families                │
│  POST /api/readings   → Narrative synthesis               │
│  GET  /api/health     → Health check                      │
└──────────────────────────────────────────────────────────┘
```

## Engine Modules

| Module | File | Purpose |
|--------|------|---------|
| Archetypes | `src/engine/archetypes.ts` | Archetype families & Major Arcana mappings |
| Spreads | `src/engine/spreads.ts` | Spread layouts, positions, card counts |
| Narrative | `src/engine/narrative.ts` | Multi-style narrative generation |
| LTL | `src/engine/ltl.ts` | Temporal logic verification (6 properties) |
| Meaning | `src/engine/meaning.ts` | Meaning function μ(c, θ) with 5 dimensions |
| Scoring | `src/engine/scoring.ts` | D1-D6 quality dimensions, composite Q |
| Iteration | `src/engine/iteration.ts` | Adaptive stopping with ΔQi < τ convergence |

## Quality Dimensions (D1-D6)

| Dimension | Name | Description | Weight |
|-----------|------|-------------|--------|
| D1 | Structural Integrity | Card uniqueness, valid positions, correct count | 0.20 |
| D2 | Archetypal Coherence | Archetype diversity and family relevance | 0.18 |
| D3 | Narrative Depth | Semantic richness and interpretation quality | 0.18 |
| D4 | Spread Balance | Positional distribution and layout utilisation | 0.15 |
| D5 | Symbolic Resonance | Keyword coherence and meaning alignment | 0.15 |
| D6 | Entropy Quality | Randomness, surprisingness, non-triviality | 0.14 |

## Data Flow

1. **User configures parameters** (θ ∈ Θ) through the 4-step wizard:
   - Cultural Framework → Entropy & Randomness → Narrative Engine → Aesthetic & Review
2. **Frontend dispatches** parameters to AppContext
3. **Generate page** triggers the adaptive iteration loop
4. **Iteration engine** runs up to N iterations, each:
   a. Cards are shuffled deterministically (optional seed)
   b. Spread is laid out according to selected layout
   c. D1-D6 quality score is computed
   d. If Q ≥ Q_target → stop (quality target convergence)
   e. If ΔQi < τ for `consecutiveStops` iterations → stop (delta convergence)
5. **Best spread** is selected and displayed with D1-D6 radar chart
6. **Narrative is generated** via GitHub LLM (with local engine fallback)
7. **LTL verification** checks 6 structural/semantic properties (4 temporal classes)
8. **Refinement** loop allows re-running with raised Q_target
9. **Iteration chart** shows Q(i) vs ΔQ(i) history + dimension trends
10. **Debug panel** (Ctrl+Shift+D) shows raw data, scores, iteration log

## Wizard Steps

| Step | Name | Parameters |
|------|------|------------|
| 1 | Cultural Framework | Archetype family, deck size, reversals |
| 2 | Entropy & Randomness | Spread type, draw count, seed |
| 3 | Narrative Engine | Meaning weights (5 dimensions) |
| 4 | Aesthetic & Review | Narrative style, configuration summary |

## Parameter Space θ

```typescript
interface TarotParameters {
  archetypeFamily: ArchetypeFamily;  // Jungian | Mythological | ...
  deckSize: 22 | 56 | 78;           // Major only | Minor only | Full
  reversalsEnabled: boolean;          // Allow reversed cards
  spreadType: SpreadType;             // celtic-cross | three-card | ...
  drawCount: number;                  // How many cards to draw
  meaningWeights: MeaningWeights;     // 5-dimensional weight vector
  narrativeStyle: NarrativeStyle;     // formal | poetic | ...
  seed?: number;                      // Deterministic generation
}
```

## LTL Property Classes

| Class | Temporal Operator | Intuition |
|-------|------------------|-----------|
| Safety | G(φ) | "Nothing bad ever happens" |
| Co-safety | F(φ) | "Something good eventually happens" |
| Liveness | GF(φ) | "Good things keep happening" |
| Co-liveness | FG(φ) | "Eventually things stabilise" |

## Design System

The visual aesthetic matches [lordeassan.github.io](https://lordeassan.github.io):
- **Dark-first** cyber/hacker theme: `#0B0F14` background, `#00FFC6` accent, `#6F42C1` accent-alt
- **Fonts**: Inter (body) + JetBrains Mono (display/mono)
- **Glassmorphism**: `backdrop-filter: blur(12px)`, semi-transparent glass surfaces
- **Bio-canvas**: Neural graph background with 50 nodes, mouse repulsion, theme-reactive colors
- **Animations**: fadeIn, fadeInUp, pulseGlow, subtleBreathe
