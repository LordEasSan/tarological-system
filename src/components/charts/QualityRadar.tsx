import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import type { QualityScore } from '../../engine/scoring';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface QualityRadarProps {
  score: QualityScore;
  className?: string;
}

export function QualityRadar({ score, className = '' }: QualityRadarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labels = score.dimensions.map(d => `${d.id}: ${d.name}`);
  const values = score.dimensions.map(d => d.score);

  const data = {
    labels,
    datasets: [
      {
        label: 'D1-D6 Quality',
        data: values,
        backgroundColor: isDark ? 'rgba(0, 255, 198, 0.15)' : 'rgba(0, 102, 255, 0.10)',
        borderColor: isDark ? 'rgba(0, 255, 198, 0.8)' : 'rgba(0, 102, 255, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: values.map(v =>
          v >= 0.7 ? 'rgba(0, 255, 198, 1)' :
          v >= 0.4 ? 'rgba(212, 168, 67, 1)' :
          'rgba(255, 85, 85, 1)'
        ),
        pointBorderColor: isDark ? '#0B0F14' : '#ffffff',
        pointBorderWidth: 1,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 0.2,
          color: isDark ? '#8a82a6' : '#475569',
          backdropColor: 'transparent',
          font: { size: 9 },
        },
        grid: {
          color: isDark ? 'rgba(0, 255, 198, 0.08)' : 'rgba(0, 102, 255, 0.06)',
        },
        angleLines: {
          color: isDark ? 'rgba(111, 66, 193, 0.2)' : 'rgba(0, 102, 255, 0.08)',
        },
        pointLabels: {
          color: isDark ? '#bdc3c7' : '#0F172A',
          font: { size: 10, family: 'JetBrains Mono, monospace' },
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? 'rgba(11, 15, 20, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#00FFC6' : '#0066FF',
        bodyColor: isDark ? '#e8e4f0' : '#374151',
        borderColor: isDark ? 'rgba(111, 66, 193, 0.4)' : 'rgba(0, 102, 255, 0.15)',
        borderWidth: 1,
        callbacks: {
          label: (ctx: { parsed: { r: number }; dataIndex: number }) => {
            const dim = score.dimensions[ctx.dataIndex];
            return `${dim.id}: ${(ctx.parsed.r * 100).toFixed(0)}% — ${dim.details}`;
          },
        },
      },
    },
  };

  return (
    <div className={`max-w-xs mx-auto ${className}`}>
      <Radar data={data} options={options} />
      <div className="mt-3 text-center">
        <span className={`font-mono text-lg font-bold ${
          score.composite >= 0.7 ? 'text-mtps-accent' :
          score.composite >= 0.4 ? 'text-mtps-gold' :
          'text-red-400'
        }`}>
          Q = {(score.composite * 100).toFixed(1)}%
        </span>
        <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
          score.passed
            ? 'bg-mtps-accent/20 text-mtps-accent'
            : 'bg-red-500/20 text-red-400'
        }`}>
          {score.passed ? 'PASSED' : 'BELOW THRESHOLD'}
        </span>
      </div>
    </div>
  );
}
