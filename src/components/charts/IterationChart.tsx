import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import type { IterationLog } from '../../engine/iteration';
import { TrendingUp, TrendingDown, Minus, CheckCircle2, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface IterationChartProps {
  log: IterationLog;
  className?: string;
}

export function IterationChart({ log, className = '' }: IterationChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labels = log.entries.map(e => `#${e.iteration}`);
  const composites = log.entries.map(e => e.quality.composite);
  const deltas = log.entries.map(e => e.deltaQ);

  const data = {
    labels,
    datasets: [
      {
        label: 'Q(i)',
        data: composites,
        borderColor: isDark ? 'rgba(0, 255, 198, 0.9)' : 'rgba(0, 102, 255, 0.9)',
        backgroundColor: isDark ? 'rgba(0, 255, 198, 0.1)' : 'rgba(0, 102, 255, 0.08)',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointBackgroundColor: composites.map((_, i) =>
          i === log.bestIteration - 1
            ? '#FFD700'
            : isDark ? 'rgba(0, 255, 198, 0.8)' : 'rgba(0, 102, 255, 0.8)'
        ),
        pointRadius: composites.map((_, i) =>
          i === log.bestIteration - 1 ? 6 : 3
        ),
        pointBorderWidth: composites.map((_, i) =>
          i === log.bestIteration - 1 ? 2 : 1
        ),
        pointBorderColor: isDark ? '#0B0F14' : '#ffffff',
      },
      {
        label: 'ΔQ(i)',
        data: deltas,
        borderColor: isDark ? 'rgba(111, 66, 193, 0.7)' : 'rgba(111, 66, 193, 0.5)',
        backgroundColor: isDark ? 'rgba(111, 66, 193, 0.05)' : 'rgba(111, 66, 193, 0.04)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        fill: false,
        tension: 0.3,
        pointRadius: 2,
        pointBackgroundColor: isDark ? 'rgba(111, 66, 193, 0.6)' : 'rgba(111, 66, 193, 0.5)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: isDark ? '#8a82a6' : '#475569', font: { size: 10, family: 'JetBrains Mono, monospace' } },
        grid: { color: isDark ? 'rgba(111, 66, 193, 0.1)' : 'rgba(0, 102, 255, 0.06)' },
      },
      y: {
        min: Math.min(0, ...deltas) - 0.05,
        max: 1.05,
        ticks: { color: isDark ? '#8a82a6' : '#475569', font: { size: 10 }, stepSize: 0.2 },
        grid: { color: isDark ? 'rgba(111, 66, 193, 0.1)' : 'rgba(0, 102, 255, 0.06)' },
      },
    },
    plugins: {
      legend: {
        labels: { color: isDark ? '#bdc3c7' : '#0F172A', font: { size: 10 }, usePointStyle: true },
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(11, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#00FFC6' : '#0066FF',
        bodyColor: isDark ? '#e8e4f0' : '#374151',
        borderColor: isDark ? 'rgba(111, 66, 193, 0.4)' : 'rgba(0, 102, 255, 0.15)',
        borderWidth: 1,
      },
    },
  };

  const convergenceLabel = {
    quality_target: 'Q ≥ Q_target',
    delta_threshold: 'ΔQi < τ',
    max_iterations: 'Max iterations',
  }[log.convergenceReason];

  return (
    <div className={className}>
      <div className="h-48">
        <Line data={data} options={options} />
      </div>

      {/* Stats Row */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="p-2 rounded-lg dark:bg-mtps-void/50 bg-gray-50 text-center">
          <p className="text-[10px] dark:text-mtps-muted text-mtps-muted uppercase tracking-wider">Iterations</p>
          <p className="font-mono text-sm font-bold dark:text-mtps-text text-mtps-text-light">{log.totalIterations}</p>
        </div>
        <div className="p-2 rounded-lg dark:bg-mtps-void/50 bg-gray-50 text-center">
          <p className="text-[10px] dark:text-mtps-muted text-mtps-muted uppercase tracking-wider">Best Q</p>
          <p className="font-mono text-sm font-bold text-mtps-accent">{(log.bestQuality * 100).toFixed(1)}%</p>
        </div>
        <div className="p-2 rounded-lg dark:bg-mtps-void/50 bg-gray-50 text-center">
          <p className="text-[10px] dark:text-mtps-muted text-mtps-muted uppercase tracking-wider">Time</p>
          <p className="font-mono text-sm font-bold dark:text-mtps-text text-mtps-text-light">{log.totalDurationMs}ms</p>
        </div>
        <div className="p-2 rounded-lg dark:bg-mtps-void/50 bg-gray-50 text-center">
          <p className="text-[10px] dark:text-mtps-muted text-mtps-muted uppercase tracking-wider">Stop</p>
          <p className="font-mono text-xs font-bold flex items-center justify-center gap-1">
            {log.converged
              ? <><CheckCircle2 className="w-3 h-3 text-mtps-accent" /><span className="text-mtps-accent">{convergenceLabel}</span></>
              : <><AlertTriangle className="w-3 h-3 text-yellow-400" /><span className="text-yellow-400">{convergenceLabel}</span></>
            }
          </p>
        </div>
      </div>

      {/* Dimension Trends */}
      {log.dimensionTrends && log.dimensionTrends.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {log.dimensionTrends.map(trend => (
            <span
              key={trend.dimension}
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono
                ${trend.improving ? 'bg-mtps-accent/10 text-mtps-accent' :
                  trend.delta < 0 ? 'bg-red-500/10 text-red-400' :
                  'bg-mtps-muted/10 dark:text-mtps-muted text-gray-500'}`}
            >
              {trend.improving ? <TrendingUp className="w-2.5 h-2.5" /> :
                trend.delta < 0 ? <TrendingDown className="w-2.5 h-2.5" /> :
                <Minus className="w-2.5 h-2.5" />}
              {trend.dimension}
              {trend.delta !== 0 && ` ${trend.delta > 0 ? '+' : ''}${(trend.delta * 100).toFixed(1)}%`}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
