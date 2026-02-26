/**
 * Engine — Adaptive Iteration Module
 *
 * Implements the adaptive stopping algorithm from the MTPS paper:
 *   1. Repeat generating readings until Q(reading) >= Q_target or max iterations reached.
 *   2. ΔQi < τ convergence: stop if the quality improvement between consecutive
 *      iterations falls below a threshold τ (deltaThreshold), indicating convergence.
 *   3. Per-dimension trend tracking across iterations.
 *   4. Refinement callbacks for UI integration.
 *
 * The iteration runner can be used both synchronously and as an async generator.
 */
import type { PlacedCard, TarotParameters } from '../types';
import { computeQualityScore } from './scoring';
import type { QualityScore, QualityDimensionId } from './scoring';

/** Per-dimension trend entry */
export interface DimensionTrend {
  dimension: QualityDimensionId;
  values: number[];
  delta: number; // latest delta
  improving: boolean;
}

/** A single iteration log entry */
export interface IterationEntry {
  iteration: number;
  quality: QualityScore;
  accepted: boolean;
  timestamp: string;
  durationMs: number;
  deltaQ: number; // ΔQi = Q(i) - Q(i-1)
  dimensionDeltas: Record<QualityDimensionId, number>;
}

/** Full iteration log */
export interface IterationLog {
  entries: IterationEntry[];
  bestIteration: number;
  bestQuality: number;
  totalIterations: number;
  converged: boolean;
  convergenceReason: 'quality_target' | 'delta_threshold' | 'max_iterations';
  totalDurationMs: number;
  dimensionTrends: DimensionTrend[];
}

/** Configuration for the iteration runner */
export interface IterationConfig {
  /** Target quality threshold Q_target ∈ [0, 1] */
  qTarget: number;
  /** Maximum iterations before forced stop */
  maxIterations: number;
  /** Optional: minimum iterations to run */
  minIterations: number;
  /** ΔQi convergence threshold τ — stop if improvement < τ for consecutiveStops iterations */
  deltaThreshold: number;
  /** Number of consecutive sub-threshold iterations before declaring convergence */
  consecutiveStops: number;
}

export const DEFAULT_ITERATION_CONFIG: IterationConfig = {
  qTarget: 0.65,
  maxIterations: 10,
  minIterations: 2,
  deltaThreshold: 0.02,
  consecutiveStops: 2,
};

/** Callback type for live iteration updates */
export type IterationCallback = (entry: IterationEntry, log: IterationEntry[]) => void;

/**
 * IterationRunner — manages the adaptive generation loop
 *
 * Usage:
 *   const runner = new IterationRunner(config);
 *   const result = runner.run(generateFn, params);
 *
 * With live callback:
 *   const result = runner.run(generateFn, params, (entry) => updateUI(entry));
 */
export class IterationRunner {
  private config: IterationConfig;
  private log: IterationEntry[] = [];

  constructor(config?: Partial<IterationConfig>) {
    this.config = { ...DEFAULT_ITERATION_CONFIG, ...config };
  }

  /**
   * Run the adaptive iteration loop
   * @param generateFn — function that generates a spread given parameters
   * @param params — tarot parameters for generation
   * @param onIteration — optional callback for live UI updates
   * @returns the best spread + full iteration log
   */
  run(
    generateFn: (params: TarotParameters) => PlacedCard[],
    params: TarotParameters,
    onIteration?: IterationCallback,
  ): { bestSpread: PlacedCard[]; log: IterationLog } {
    this.log = [];

    let bestSpread: PlacedCard[] = [];
    let bestQuality = -1;
    let bestIteration = 0;
    let converged = false;
    let convergenceReason: IterationLog['convergenceReason'] = 'max_iterations';
    let prevComposite = 0;
    let consecutiveSubThreshold = 0;
    const globalStart = performance.now();

    // Track per-dimension history
    const dimensionHistory: Record<QualityDimensionId, number[]> = {
      D1: [], D2: [], D3: [], D4: [], D5: [], D6: [],
    };

    for (let i = 1; i <= this.config.maxIterations; i++) {
      const iterStart = performance.now();
      const spread = generateFn(params);
      const quality = computeQualityScore(spread, params, this.config.qTarget);
      const iterEnd = performance.now();

      // Compute ΔQ
      const deltaQ = i > 1 ? quality.composite - prevComposite : quality.composite;

      // Compute per-dimension deltas
      const dimensionDeltas: Record<string, number> = {};
      for (const dim of quality.dimensions) {
        const id = dim.id as QualityDimensionId;
        const prev = dimensionHistory[id];
        const prevVal = prev.length > 0 ? prev[prev.length - 1] : 0;
        dimensionDeltas[id] = dim.score - prevVal;
        dimensionHistory[id].push(dim.score);
      }

      const entry: IterationEntry = {
        iteration: i,
        quality,
        accepted: quality.composite >= this.config.qTarget,
        timestamp: new Date().toISOString(),
        durationMs: Math.round(iterEnd - iterStart),
        deltaQ,
        dimensionDeltas: dimensionDeltas as Record<QualityDimensionId, number>,
      };

      this.log.push(entry);
      if (onIteration) onIteration(entry, [...this.log]);

      if (quality.composite > bestQuality) {
        bestQuality = quality.composite;
        bestSpread = spread;
        bestIteration = i;
      }

      // Check convergence conditions (only after minIterations)
      if (i >= this.config.minIterations) {
        // Condition 1: Quality target met
        if (quality.composite >= this.config.qTarget) {
          converged = true;
          convergenceReason = 'quality_target';
          break;
        }

        // Condition 2: ΔQi < τ convergence
        if (i > 1 && Math.abs(deltaQ) < this.config.deltaThreshold) {
          consecutiveSubThreshold++;
          if (consecutiveSubThreshold >= this.config.consecutiveStops) {
            converged = true;
            convergenceReason = 'delta_threshold';
            break;
          }
        } else {
          consecutiveSubThreshold = 0;
        }
      }

      prevComposite = quality.composite;
    }

    const globalEnd = performance.now();

    // Build dimension trends
    const dimensionTrends: DimensionTrend[] = (['D1', 'D2', 'D3', 'D4', 'D5', 'D6'] as QualityDimensionId[]).map(id => {
      const values = dimensionHistory[id];
      const delta = values.length >= 2 ? values[values.length - 1] - values[values.length - 2] : 0;
      return {
        dimension: id,
        values,
        delta,
        improving: delta > 0,
      };
    });

    return {
      bestSpread,
      log: {
        entries: this.log,
        bestIteration,
        bestQuality,
        totalIterations: this.log.length,
        converged,
        convergenceReason,
        totalDurationMs: Math.round(globalEnd - globalStart),
        dimensionTrends,
      },
    };
  }

  /** Get current log entries (for live UI updates) */
  getLog(): IterationEntry[] {
    return [...this.log];
  }

  /** Get current config */
  getConfig(): IterationConfig {
    return { ...this.config };
  }

  /** Update config */
  setConfig(config: Partial<IterationConfig>): void {
    this.config = { ...this.config, ...config };
  }
}
